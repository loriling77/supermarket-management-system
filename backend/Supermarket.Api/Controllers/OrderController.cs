
using System.Data;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Supermarket.Api.Data;
using Supermarket.Api.Dtos;
using Supermarket.Api.Models;

namespace Supermarket.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrderController(AppDbContext context)
    {
        _context = context;
    }


    [HttpPost("checkout")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> Checkout(
        CheckoutRequestDto request)
    {
        // Admin must not access User checkout
        if (User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        if (request.Items == null ||
            request.Items.Count == 0)
        {
            return BadRequest("Shopping cart is empty.");
        }

        if (request.Items.Any(x =>
            x.ProductId <= 0 || x.Quantity <= 0))
        {
            return BadRequest("Invalid cart item.");
        }

        // Combine duplicate product IDs
        var items = request.Items
            .GroupBy(x => x.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Quantity = g.Sum(x => (long)x.Quantity)
            })
            .ToList();

        if (items.Any(x => x.Quantity > int.MaxValue))
        {
            return BadRequest("Invalid quantity.");
        }

        // Azure SQL retry strategy
        var strategy =
            _context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync<IActionResult>(
            async () =>
            {
                // Start a transaction inside the retry strategy
                await using var transaction =
                    await _context.Database.BeginTransactionAsync(
                        IsolationLevel.Serializable
                    );

                var order = new Order
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Paid"
                };

                decimal totalAmount = 0;

                foreach (var item in items.OrderBy(x => x.ProductId))
                {
                    var product = await _context.Products
                        .FirstOrDefaultAsync(
                            p => p.Id == item.ProductId
                        );

                    if (product == null)
                    {
                        return BadRequest(
                            $"Product {item.ProductId} not found."
                        );
                    }

                    if (product.Count < item.Quantity)
                    {
                        return BadRequest(
                            $"Not enough stock for {product.ProductName}."
                        );
                    }

                    var quantity = (int)item.Quantity;

                    product.Count -= quantity;

                    var lineTotal = product.Price * quantity;

                    totalAmount += lineTotal;

                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.ProductName,
                        UnitPrice = product.Price,
                        Quantity = quantity,
                        TotalPrice = lineTotal
                    });
                }

                order.TotalAmount = totalAmount;

                _context.Orders.Add(order);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Payment successful",
                    orderId = order.Id,
                    totalAmount = order.TotalAmount
                });
            }
        );
    }


    [HttpGet("mine")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetMySuccessfulOrders(CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        // Scope the query to the authenticated customer, never a browser-supplied ID.
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(order => order.UserId == userId && order.Status == "Paid")
            .OrderByDescending(order => order.CreatedAt)
            .ThenByDescending(order => order.Id)
            .Select(order => new
            {
                order.Id,
                CreatedAt = DateTime.SpecifyKind(order.CreatedAt, DateTimeKind.Utc),
                order.TotalAmount,
                order.Status,
                Items = order.OrderItems.Select(item => new
                {
                    item.ProductId,
                    item.ProductName,
                    item.UnitPrice,
                    item.Quantity,
                    item.TotalPrice
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }


    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrdersByUser(string userId)
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.CreatedAt,
                o.TotalAmount,
                o.Status,

                Items = o.OrderItems.Select(item => new
                {
                    item.ProductId,
                    item.ProductName,
                    item.UnitPrice,
                    item.Quantity,
                    item.TotalPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }


    [HttpGet("count")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTotalOrders()
    {
        var totalOrders = await _context.Orders.CountAsync();
        return Ok(new { totalOrders });
    }

    [HttpGet("sales")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTotalSales()
    {
        var totalSales = await _context.Orders
        .Where(o => o.Status == "Paid")
        .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        return Ok(new { totalSales });

    }

    [HttpGet("top-products")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTopSellingProducts()
    {
        var topProducts = await _context.OrderItems
            .Where(item => _context.Orders.Any(order =>
                order.Id == item.OrderId &&
                order.Status == "Paid"))
            .GroupBy(item => new
            {
                item.ProductId,
                item.ProductName
            })
            .Select(group => new
            {
                group.Key.ProductId,
                group.Key.ProductName,
                UnitsSold = group.Sum(item => item.Quantity)
            })
            .OrderByDescending(product => product.UnitsSold)
            .Take(5)
            .ToListAsync();

        return Ok(topProducts);
    }

    [HttpGet("sales-overview")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSalesOverview()
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-6);

        var salesData = await _context.Orders
            .AsNoTracking()
            .Where(order =>
                order.Status == "Paid" &&
                order.CreatedAt >= startDate)
            .GroupBy(order => order.CreatedAt.Date)
            .Select(group => new
            {
                Date = group.Key,
                TotalSales = group.Sum(order => order.TotalAmount)
            })
            .OrderBy(item => item.Date)
            .ToListAsync();

        var result = Enumerable.Range(0, 7)
            .Select(day =>
            {
                var date = startDate.AddDays(day);

                var sales = salesData.FirstOrDefault(
                    item => item.Date == date
                );

                return new
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    TotalSales = sales?.TotalSales ?? 0m
                };
            })
            .ToList();

        return Ok(result);
    }



}





