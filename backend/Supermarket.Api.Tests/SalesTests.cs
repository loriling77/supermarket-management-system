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
        // Arrange: 创建独立的内存数据库
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        // 添加三个测试订单
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

        // Act: 调用真正的 Total Sales 方法
        var result = await controller.GetTotalSales();

        // Assert: 检查 API 返回 Ok
        var okResult = Assert.IsType<OkObjectResult>(result);

        // 读取匿名对象中的 totalSales
        var totalSalesProperty = okResult.Value!
            .GetType()
            .GetProperty("totalSales");

        Assert.NotNull(totalSalesProperty);

        var totalSales = totalSalesProperty.GetValue(okResult.Value);

        // 只计算 Paid 订单：10 + 20 = 30
        Assert.Equal(30.00m, totalSales);
    }
}