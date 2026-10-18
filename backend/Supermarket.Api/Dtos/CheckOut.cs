
namespace Supermarket.Api.Dtos;

public class CheckoutRequestDto
{
    public List<CheckoutItemDto> Items { get; set; } = new();
}

public class CheckoutItemDto
{
    public int ProductId { get; set; }

    public int Quantity { get; set; }
}
