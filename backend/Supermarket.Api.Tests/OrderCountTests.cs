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
        // Arrange: 创建独立的内存数据库
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        // 添加 3 个测试订单
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

        // Act: 调用真正的订单统计 API 方法
        var result = await controller.GetTotalOrders();

        // Assert: 检查是否返回 Ok
        var okResult = Assert.IsType<OkObjectResult>(result);

        // 检查返回对象中的 totalOrders
        var totalOrdersProperty = okResult.Value!
            .GetType()
            .GetProperty("totalOrders");

        Assert.NotNull(totalOrdersProperty);

        var totalOrders = totalOrdersProperty.GetValue(okResult.Value);

        Assert.Equal(3, totalOrders);
    }
}