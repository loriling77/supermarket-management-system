using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Xunit;

namespace Supermarket.Api.Tests;

public class SalesTests
{
    [Fact]
    public async Task GetTotalSales_OnlyCountsPaidOrders()
    {
        // Arrange: create an isolated in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        // Add three test orders
        context.Orders.AddRange(
            new Order
            {
                UserId = "user-1",
                Status = "Paid",
                TotalAmount = 10.00m
            },
            new Order
            {
                UserId = "user-2",
                Status = "Paid",
                TotalAmount = 20.00m
            },
            new Order
            {
                UserId = "user-3",
                Status = "Cancelled",
                TotalAmount = 30.00m
            }
        );

        await context.SaveChangesAsync();

        var controller = new OrderController(context);

        // Act: call the actual total sales action
        var result = await controller.GetTotalSales();

        // Assert: verify that the API returns OK
        var okResult = Assert.IsType<OkObjectResult>(result);

        // Read totalSales from the anonymous response object
        var totalSalesProperty = okResult.Value!
            .GetType()
            .GetProperty("totalSales");

        Assert.NotNull(totalSalesProperty);

        var totalSales = totalSalesProperty.GetValue(okResult.Value);

        // Count only paid orders: 10 + 20 = 30
        Assert.Equal(30.00m, totalSales);
    }
}