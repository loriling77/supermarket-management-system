using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;

namespace Supermarket.Api.Tests;

public class MyOrdersTests
{
    private static AppDbContext Database() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static OrderController Controller(AppDbContext db, string? userId = "customer-a")
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "User") };
        if (userId is not null) claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
        return new OrderController(db)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"))
                }
            }
        };
    }

    private static JsonElement Body(IActionResult result) => JsonSerializer.SerializeToElement(
        Assert.IsType<OkObjectResult>(result).Value,
        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

    [Fact]
    public async Task ReturnsOnlyTheSignedInCustomersPaidOrdersWithStoredLineItems()
    {
        await using var db = Database();
        db.Orders.AddRange(
            new Order { Id=1, UserId="customer-a", Status="Paid", TotalAmount=5m,
                OrderItems=[new OrderItem { ProductId=7, ProductName="Apples", Quantity=2, UnitPrice=2.5m, TotalPrice=5m }] },
            new Order { Id=2, UserId="customer-b", Status="Paid" },
            new Order { Id=3, UserId="customer-a", Status="Pending" },
            new Order { Id=4, UserId="customer-a", Status="Failed" });
        await db.SaveChangesAsync();
        var controller = Controller(db);
        controller.HttpContext.Request.QueryString = new QueryString("?userId=customer-b");
        var body = Body(await controller.GetMySuccessfulOrders());
        var order = Assert.Single(body.EnumerateArray());
        Assert.Equal(1, order.GetProperty("id").GetInt32());
        Assert.Equal("Paid", order.GetProperty("status").GetString());
        Assert.Equal(5m, order.GetProperty("totalAmount").GetDecimal());
        var line = Assert.Single(order.GetProperty("items").EnumerateArray());
        Assert.Equal("Apples", line.GetProperty("productName").GetString());
        Assert.Equal(2, line.GetProperty("quantity").GetInt32());
        Assert.Equal(2.5m, line.GetProperty("unitPrice").GetDecimal());
        Assert.Equal(5m, line.GetProperty("totalPrice").GetDecimal());
    }

    [Fact]
    public async Task ReturnsNewestOrdersFirstWithDeterministicIdOrderForMatchingDates()
    {
        await using var db = Database();
        var date = new DateTime(2026, 10, 21, 12, 0, 0, DateTimeKind.Utc);
        db.Orders.AddRange(
            new Order { Id=1, UserId="customer-a", CreatedAt=date.AddDays(-1) },
            new Order { Id=2, UserId="customer-a", CreatedAt=date },
            new Order { Id=3, UserId="customer-a", CreatedAt=date });
        await db.SaveChangesAsync();
        var body = Body(await Controller(db).GetMySuccessfulOrders());
        Assert.Equal(new[] {3, 2, 1}, body.EnumerateArray().Select(o => o.GetProperty("id").GetInt32()));
    }

    [Fact]
    public async Task ReturnsEmptyListWhenOnlyOtherCustomersHavePaidOrders()
    {
        await using var db = Database();
        db.Orders.Add(new Order { UserId="customer-b" });
        await db.SaveChangesAsync();
        Assert.Empty(Body(await Controller(db).GetMySuccessfulOrders()).EnumerateArray());
    }

    [Fact]
    public async Task StoredUtcTimestampKeepsTimezoneInTheResponse()
    {
        await using var db = Database();
        // SQL Server datetime2 does not preserve DateTime.Kind.
        db.Orders.Add(new Order { UserId="customer-a",
            CreatedAt=new DateTime(2026, 10, 21, 12, 0, 0, DateTimeKind.Unspecified) });
        await db.SaveChangesAsync();
        var order = Assert.Single(Body(await Controller(db).GetMySuccessfulOrders()).EnumerateArray());
        Assert.Equal("2026-10-21T12:00:00Z", order.GetProperty("createdAt").GetString());
    }

    [Fact]
    public async Task RejectsMissingUserIdentifier()
    {
        await using var db = Database();
        Assert.IsType<UnauthorizedResult>(await Controller(db, null).GetMySuccessfulOrders());
    }
}
