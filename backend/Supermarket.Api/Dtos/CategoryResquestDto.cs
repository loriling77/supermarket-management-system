using System.ComponentModel.DataAnnotations;

namespace Supermarket.Api.Dtos;

public class CategoryRequestDto
{
    [Required]
    public string CategoryName { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;
}