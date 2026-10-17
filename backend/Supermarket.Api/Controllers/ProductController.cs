using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Dtos;
using System.Runtime.CompilerServices;

namespace Supermarket.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
            .Include(p => p.Manufacture)
            .Include(p => p.Category)

            .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
            .Include(p => p.Manufacture)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound();
            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> AddProduct(ProductRequestDto dto)
        {
            var product = new Product
            {
                ProductName = dto.ProductName,
                ManufactureId = dto.ManufactureId,
                CategoryId = dto.CategoryId,
                Price = dto.Price,
                Count = dto.Count
            };

            product.Id = 0;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetProduct),
                new { id = product.Id },
                product
            );
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Product>> UpdateProduct(int id, ProductRequestDto dto)
        {

            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.ProductName = dto.ProductName;
            product.ManufactureId = dto.ManufactureId;
            product.CategoryId = dto.CategoryId;

            product.Price = dto.Price;
            product.Count = dto.Count;

            await _context.SaveChangesAsync();
            return NoContent();



        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<Product>> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();


        }
    }
}
