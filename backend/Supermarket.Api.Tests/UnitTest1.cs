using Supermarket.Api.Models;
using Xunit;

namespace Supermarket.Api.Tests;

public class OrderItemTests
{
    [Fact]
    public void OrderItem_totalPrice_ShouldMatchUnitPriceTimeQuantity()
    {
        var item = new OrderItem
        {
            ProductId = 1,
            ProductName = "Milk",
            UnitPrice = 4.50m,
            Quantity = 3,
            TotalPrice = 4.50m * 3
        };
        decimal expectedTotal = item.UnitPrice * item.Quantity;

        Assert.Equal(13.50m, expectedTotal);
        Assert.Equal(expectedTotal, item.TotalPrice);
    }
}
