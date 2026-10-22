using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Xunit;

namespace Supermarket.Api.Tests;

public class OrderCountTests
{
    [Fact]
    public async Task GetTotalOrders_WithThreeOrders_ReturnsThree()
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
                TotalAmount = 10.00m,
                Status = "Paid"
            },
            new Order
            {
                UserId = "user-2",
                TotalAmount = 20.00m,
                Status = "Paid"
            },
            new Order
            {
                UserId = "user-3",
                TotalAmount = 30.00m,
                Status = "Paid"
            }
        );

        await context.SaveChangesAsync();

        var controller = new OrderController(context);

        // Act: call the actual order count action
        var result = await controller.GetTotalOrders();

        // Assert: verify that the result is OK
        var okResult = Assert.IsType<OkObjectResult>(result);

        // Verify totalOrders in the response object
        var totalOrdersProperty = okResult.Value!
            .GetType()
            .GetProperty("totalOrders");

        Assert.NotNull(totalOrdersProperty);

        var totalOrders = totalOrdersProperty.GetValue(okResult.Value);

        Assert.Equal(3, totalOrders);
    }
}