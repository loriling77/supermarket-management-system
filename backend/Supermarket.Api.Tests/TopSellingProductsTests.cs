
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Xunit;

namespace Supermarket.Api.Tests;

public class TopSellingProductsTests
{
    [Fact]
    public async Task GetTopSellingProducts_RanksPaidSalesCorrectly()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        context.Orders.AddRange(
            new Order
            {
                UserId = "user-1",
                Status = "Paid",
                TotalAmount = 40m,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        ProductId = 1,
                        ProductName = "Milk",
                        UnitPrice = 5m,
                        Quantity = 5,
                        TotalPrice = 25m
                    },
                    new OrderItem
                    {
                        ProductId = 2,
                        ProductName = "Bread",
                        UnitPrice = 3m,
                        Quantity = 5,
                        TotalPrice = 15m
                    }
                }
            },
            new Order
            {
                UserId = "user-2",
                Status = "Paid",
                TotalAmount = 15m,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        ProductId = 1,
                        ProductName = "Milk",
                        UnitPrice = 5m,
                        Quantity = 3,
                        TotalPrice = 15m
                    }
                }
            },
            new Order
            {
                UserId = "user-3",
                Status = "Cancelled",
                TotalAmount = 300m,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        ProductId = 2,
                        ProductName = "Bread",
                        UnitPrice = 3m,
                        Quantity = 100,
                        TotalPrice = 300m
                    }
                }
            }
        );

        await context.SaveChangesAsync();

        var controller = new OrderController(context);

        var result = await controller.GetTopSellingProducts();

        var ok = Assert.IsType<OkObjectResult>(result);

        var products = Assert.IsAssignableFrom<System.Collections.IEnumerable>(
            ok.Value).Cast<object>().ToList();

        Assert.Equal(2, products.Count);

        static T Read<T>(object value, string propertyName)
        {
            var property = value.GetType().GetProperty(
                propertyName,
                BindingFlags.Public | BindingFlags.Instance);

            Assert.NotNull(property);

            return Assert.IsType<T>(property.GetValue(value));
        }

        Assert.Equal("Milk", Read<string>(
            products[0], "ProductName"));
        Assert.Equal(8, Read<int>(
            products[0], "UnitsSold"));

        Assert.Equal("Bread", Read<string>(
            products[1], "ProductName"));
        Assert.Equal(5, Read<int>(
            products[1], "UnitsSold"));
    }
}
