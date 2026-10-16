using System;

namespace Supermarket.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public ICollection<Product> Product { get; set; }
    = new List<Product>();

}
