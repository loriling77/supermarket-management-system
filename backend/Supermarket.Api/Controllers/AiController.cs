
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Data;
using Supermarket.Api.Dtos;
using Supermarket.Api.Services;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace Supermarket.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize(Roles = "User")]
public class AiController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AzureAiService _aiService;
    private readonly ILogger<AiController> _logger;

    public AiController(
        AppDbContext db,
        AzureAiService aiService,
        ILogger<AiController> logger)
    {
        _db = db;
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AiChatResponse>> Chat(
        [FromBody] AiChatRequest request)
    {
        var message = request.Message?.Trim();

        if (string.IsNullOrWhiteSpace(message))
        {
            return BadRequest("Please enter a message.");
        }

        if (message.Length > 500)
        {
            return BadRequest("Message is too long.");
        }

        // Read available products from SQL Server
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => p.Count > 0)
            .OrderBy(p => p.Id)
            .Select(p => new AiProductDto
            {
                Id = p.Id,
                ProductName = p.ProductName,
                Price = p.Price,
                Count = p.Count
            })
            .Take(100)
            .ToListAsync();

        if (products.Count == 0)
        {
            return Ok(new AiChatResponse
            {
                Reply = "There are currently no products in stock.",
                Products = new List<AiProductDto>(),
                ShoppingList = null
            });
        }

        var productContext = JsonSerializer.Serialize(products);

        try
        {
            // Azure AI returns JSON containing:
            // reply, productIds and shoppingList
            var aiJson = await _aiService.AskAsync(
                message,
                productContext);

            using var aiDocument = JsonDocument.Parse(aiJson);

            var aiResult = aiDocument.RootElement;

            if (aiResult.ValueKind != JsonValueKind.Object)
            {
                throw new JsonException(
                    "AI response must be a JSON object.");
            }

            // 1. Read AI reply
            var reply =
                aiResult.TryGetProperty("reply", out var replyElement)
                && replyElement.ValueKind == JsonValueKind.String
                    ? replyElement.GetString()
                        ?? "Sorry, I couldn't generate a response."
                    : "Sorry, I couldn't generate a response.";

            // 2. Read product IDs for normal questions
            var productIds = new HashSet<int>();

            if (aiResult.TryGetProperty(
                    "productIds", out var idsElement)
                && idsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var idElement in idsElement.EnumerateArray())
                {
                    if (idElement.ValueKind == JsonValueKind.Number
                        && idElement.TryGetInt32(out var id))
                    {
                        productIds.Add(id);
                    }
                }
            }

            var selectedProducts = products
                .Where(p => productIds.Contains(p.Id))
                .ToList();

            // 3. Read optional AI shopping list
            AiShoppingListDto? shoppingList = null;

            if (aiResult.TryGetProperty(
                    "shoppingList", out var listElement)
                && listElement.ValueKind == JsonValueKind.Object)
            {
                decimal? budget = null;

                if (listElement.TryGetProperty(
                        "budget", out var budgetElement)
                    && budgetElement.ValueKind == JsonValueKind.Number
                    && budgetElement.TryGetDecimal(
                        out var parsedBudget)
                    && parsedBudget >= 0)
                {
                    budget = parsedBudget;
                }

                // Collect quantities requested by AI
                var requestedQuantities =
                    new Dictionary<int, int>();

                if (listElement.TryGetProperty(
                        "items", out var itemsElement)
                    && itemsElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in itemsElement.EnumerateArray())
                    {
                        if (item.ValueKind != JsonValueKind.Object)
                        {
                            continue;
                        }

                        if (!item.TryGetProperty(
                                "productId", out var idElement)
                            || idElement.ValueKind != JsonValueKind.Number
                            || !idElement.TryGetInt32(
                                out var productId))
                        {
                            continue;
                        }

                        if (!item.TryGetProperty(
                                "quantity", out var quantityElement)
                            || quantityElement.ValueKind != JsonValueKind.Number
                            || !quantityElement.TryGetInt32(
                                out var quantity))
                        {
                            continue;
                        }

                        if (quantity <= 0)
                        {
                            continue;
                        }

                        // Combine duplicate product IDs
                        if (requestedQuantities.TryGetValue(
                                productId, out var existingQuantity))
                        {
                            var combined =
                                (long)existingQuantity + quantity;

                            requestedQuantities[productId] =
                                (int)Math.Min(
                                    combined,
                                    int.MaxValue);
                        }
                        else
                        {
                            requestedQuantities[productId] = quantity;
                        }
                    }
                }

                // 4. Validate against real database products
                var validatedItems =
                    new List<AiShoppingListItemDto>();

                foreach (var product in products)
                {
                    if (!requestedQuantities.TryGetValue(
                            product.Id, out var requestedQuantity))
                    {
                        continue;
                    }

                    if (product.Count <= 0 || product.Price < 0)
                    {
                        continue;
                    }

                    var quantity = Math.Min(
                        requestedQuantity,
                        product.Count);

                    validatedItems.Add(
                        new AiShoppingListItemDto
                        {
                            ProductId = product.Id,
                            ProductName = product.ProductName,
                            UnitPrice = product.Price,
                            Quantity = quantity,
                            AvailableStock = product.Count
                        });
                }

                // 5. Validate budget using database prices
                if (budget.HasValue)
                {
                    var remainingBudget = budget.Value;

                    var affordableItems =
                        new List<AiShoppingListItemDto>();

                    foreach (var item in validatedItems)
                    {
                        int affordableQuantity;

                        if (item.UnitPrice == 0)
                        {
                            affordableQuantity = item.Quantity;
                        }
                        else
                        {
                            var maximumAffordable =
                                Math.Floor(
                                    remainingBudget / item.UnitPrice);

                            affordableQuantity = (int)Math.Min(
                                (decimal)item.Quantity,
                                maximumAffordable);
                        }

                        if (affordableQuantity <= 0)
                        {
                            continue;
                        }

                        item.Quantity = affordableQuantity;

                        affordableItems.Add(item);

                        remainingBudget -= item.TotalPrice;
                    }

                    validatedItems = affordableItems;
                }

                // 6. Calculate trusted total
                var totalPrice = validatedItems.Sum(
                    item => item.TotalPrice);

                shoppingList = new AiShoppingListDto
                {
                    Budget = budget,
                    TotalPrice = totalPrice,
                    Items = validatedItems
                };

                // Shopping-list requests use the list UI,
                // not duplicate individual product cards.
                selectedProducts = new List<AiProductDto>();

                // The AI's original text may mention quantities
                // that were changed during validation.
                // Provide a consistent summary instead.
                reply = validatedItems.Count > 0
                    ? budget.HasValue
                        ? $"Here is your shopping list. " +
                          $"Total: £{totalPrice:F2}. " +
                          $"Budget: £{budget.Value:F2}."
                        : $"Here is your shopping list. " +
                          $"Total: £{totalPrice:F2}."
                    : "Sorry, no suitable products are available " +
                      "for this shopping list and budget.";
            }

            return Ok(new AiChatResponse
            {
                Reply = reply,
                Products = selectedProducts,
                ShoppingList = shoppingList
            });
        }
        catch (JsonException ex)
        {
            _logger.LogError(
                ex,
                "Azure AI returned invalid JSON.");

            return StatusCode(502, new
            {
                error = "The AI response could not be processed."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Azure AI request failed.");

            return StatusCode(502, new
            {
                error = "The AI service is temporarily unavailable."
            });
        }
    }
}
