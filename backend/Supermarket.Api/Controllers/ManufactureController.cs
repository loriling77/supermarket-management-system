using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Supermarket.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<ActionResult<Manufacture>> AddManufacture(Manufacture manufacture)
        {
            manufacture.Id = 0;
            _context.Manufactures.Add(manufacture);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
               nameof(GetManufacture),
               new { id = manufacture.Id },
               manufacture
            );
        }
        [HttpPut("{id}")]

        public async Task<ActionResult<Manufacture>> UpdateManufacture(int id, Manufacture updatedManufacture)
        {
            if (id != updatedManufacture.Id)
                return BadRequest();
            var manufacture = await _context.Manufactures.FindAsync(id);
            if (manufacture == null)
                return NotFound();

            manufacture.ManufactureName = updatedManufacture.ManufactureName;
            manufacture.ProductionLiscenseNumber = updatedManufacture.ProductionLiscenseNumber;
            manufacture.PlaceOfOrigin = updatedManufacture.PlaceOfOrigin;

            await _context.SaveChangesAsync();
            return NoContent();

        }
        [HttpDelete("{id}")]
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
