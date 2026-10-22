using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Supermarket.Api.Data;
using Supermarket.Api.Dtos;
using Supermarket.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Supermarket.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,User")]
    public class ManufactureController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ManufactureController(AppDbContext context)
        { _context = context; }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Manufacture>>> GetManufactures()
        {
            return await _context.Manufactures.ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Manufacture>> GetManufacture(int id)
        {
            var manufacture = await _context.Manufactures.FindAsync(id);
            if (manufacture == null)
                return NotFound();
            return manufacture;

        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Manufacture>> AddManufacture(ManufactureRequestDto dto)
        {
            var manufacture = new Manufacture
            {
                ManufactureName = dto.ManufactureName,
                ProductionLiscenseNumber = dto.ProductionLiscenseNumber,
                PlaceOfOrigin = dto.PlaceOfOrigin

            };
            _context.Manufactures.Add(manufacture);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
               nameof(GetManufacture),
               new { id = manufacture.Id },
               manufacture
            );
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]

        public async Task<ActionResult<Manufacture>> UpdateManufacture(int id, ManufactureRequestDto dto)
        {

            var manufacture = await _context.Manufactures.FindAsync(id);
            if (manufacture == null)
                return NotFound();

            manufacture.ManufactureName = dto.ManufactureName;
            manufacture.ProductionLiscenseNumber = dto.ProductionLiscenseNumber;
            manufacture.PlaceOfOrigin = dto.PlaceOfOrigin;

            await _context.SaveChangesAsync();
            return NoContent();

        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Manufacture>> DeleteManufacture(int id)
        {
            var manufacture = await _context.Manufactures.FindAsync(id);
            if (manufacture == null)
                return NotFound();

            _context.Manufactures.Remove(manufacture);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
