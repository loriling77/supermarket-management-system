using System.ComponentModel.DataAnnotations;

namespace Supermarket.Api.Dtos;

public class ManufactureRequestDto
{

    [Required]
    public string ManufactureName { get; set; } = string.Empty;
    [Required]
    public string ProductionLiscenseNumber { get; set; } = string.Empty;

    public string PlaceOfOrigin { get; set; } = string.Empty;

}
