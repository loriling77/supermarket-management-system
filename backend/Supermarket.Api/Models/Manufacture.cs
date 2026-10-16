using System;
using System.Runtime.CompilerServices;

namespace Supermarket.Api.Models;

public class Manufacture
{
    public int Id { get; set; }
    public string ManufactureName { get; set; } = string.Empty;
    public string ProductionLiscenseNumber { get; set; } = string.Empty;
    public string PlaceOfOrigin { get; set; } = string.Empty;

    public ICollection<Product> Products { get; set; }
    = new List<Product>();
}
