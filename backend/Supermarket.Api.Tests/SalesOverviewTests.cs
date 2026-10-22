
using System.Globalization;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Xunit;

namespace Supermarket.Api.Tests;

public class SalesOverviewTests
{
    [Fact]
    public async Task GetSalesOverview_ReturnsSevenDaysAndZeroForMissingDays()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        var today = DateTime.UtcNow.Date;
        var yesterday = today.AddDays(-1);

        context.Orders.AddRange(
            new Order
            {
                UserId = "user-1",
                Status = "Paid",
                TotalAmount = 20m,
                CreatedAt = yesterday
            },
            new Order
            {
                UserId = "user-2",
                Status = "Paid",
                TotalAmount = 30m,
                CreatedAt = yesterday
            },
            new Order
            {
                UserId = "user-3",
                Status = "Cancelled",
                TotalAmount = 100m,
                CreatedAt = today
            }
        );

        await context.SaveChangesAsync();

        var controller = new OrderController(context);

        var result = await controller.GetSalesOverview();

        var ok = Assert.IsType<OkObjectResult>(result);

        var days = Assert.IsAssignableFrom<System.Collections.IEnumerable>(
            ok.Value).Cast<object>().ToList();

        Assert.Equal(7, days.Count);

        static T Read<T>(object value, string propertyName)
        {
            var property = value.GetType().GetProperty(
                propertyName,
                BindingFlags.Public | BindingFlags.Instance);

            Assert.NotNull(property);

            return Assert.IsType<T>(property.GetValue(value));
        }

        var yesterdayRow = days.Single(day =>
            Read<string>(day, "Date") ==
            yesterday.ToString("yyyy-MM-dd"));

        Assert.Equal(50m, Read<decimal>(
            yesterdayRow, "TotalSales"));

        var todayRow = days.Single(day =>
            Read<string>(day, "Date") ==
            today.ToString("yyyy-MM-dd"));

        Assert.Equal(0m, Read<decimal>(
            todayRow, "TotalSales"));
    }
}
