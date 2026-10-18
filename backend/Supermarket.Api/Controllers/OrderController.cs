
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

}
