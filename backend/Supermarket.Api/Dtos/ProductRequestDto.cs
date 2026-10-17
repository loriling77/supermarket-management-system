using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;

namespace Supermarket.Api.Dtos;

public class ProductRequestDto
{
    [Required]
    public string ProductName { get; set; } = string.Empty;
    [Range(1, int.MaxValue)]
    public int ManufactureId { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Count { get; set; }
}
