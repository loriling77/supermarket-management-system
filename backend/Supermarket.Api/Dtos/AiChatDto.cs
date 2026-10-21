using System;

namespace Supermarket.Api.Dtos;

public class AiChatRequest
{
    public string Message { get; set; } = string.Empty;
}

public class AiProductDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Count { get; set; }
}

public class AiChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public List<AiProductDto> Products { get; set; } = new();
    public AiShoppingListDto? ShoppingList { get; set; }
}


public class AiShoppingListItemDto
{
    public int ProductId { get; set; }

    public string ProductName { get; set; }
        = string.Empty;

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public int AvailableStock { get; set; }

    public decimal TotalPrice =>
        UnitPrice * Quantity;
}

public class AiShoppingListDto
{
    public decimal? Budget { get; set; }

    public decimal TotalPrice { get; set; }

    public List<AiShoppingListItemDto> Items { get; set; }
        = new();
}

