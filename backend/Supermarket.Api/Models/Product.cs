using System;

namespace Supermarket.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int ManufactureId { get; set; }
    public Manufacture Manufacture { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public decimal Price { get; set; }
    public int Count { get; set; }


}
