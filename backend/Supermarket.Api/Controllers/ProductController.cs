using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Dtos;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .AsNoTracking()
                .Select(p => new
                {
                    p.Id,
                    p.ProductName,
                    p.Price,
                    p.Count,
                    p.CategoryId,
                    p.ManufactureId,

                    CategoryName = p.Category != null
                        ? p.Category.CategoryName
                        : null,

                    ManufactureName = p.Manufacture != null
                        ? p.Manufacture.ManufactureName
                        : null
                })
                .ToListAsync();

            return Ok(products);
        }



        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.ProductName,
                    p.Price,
                    p.Count,
                    p.CategoryId,
                    p.ManufactureId
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> AddProduct(
    ProductRequestDto dto)
        {
            var productName = dto.ProductName?.Trim();

            if (string.IsNullOrWhiteSpace(productName))
            {
                return BadRequest(new
                {
                    message = "Product name is required."
                });
            }

            // Check whether the same product already exists
            var existingProduct = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.ProductName.Trim().ToLower() == productName.ToLower() &&
                    p.ManufactureId == dto.ManufactureId &&
                    p.CategoryId == dto.CategoryId
                );

            if (existingProduct != null)
            {
                return Conflict(new
                {
                    message = "Product already exists."
                });
            }

            var product = new Product
            {
                ProductName = productName,
                ManufactureId = dto.ManufactureId,
                CategoryId = dto.CategoryId,
                Price = dto.Price,
                Count = dto.Count
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetProduct),
                new { id = product.Id },
                product
            );
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> UpdateProduct(
      int id,
      ProductRequestDto dto)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound();

            var productName = dto.ProductName.Trim();

            bool productExists = await _context.Products
                .AnyAsync(p =>
                    p.Id != id &&
                    p.ProductName == productName &&
                    p.ManufactureId == dto.ManufactureId &&
                    p.CategoryId == dto.CategoryId
                );

            if (productExists)
            {
                return Conflict(new
                {
                    message = "Product already exists."
                });
            }

            product.ProductName = productName;
            product.ManufactureId = dto.ManufactureId;
            product.CategoryId = dto.CategoryId;
            product.Price = dto.Price;
            product.Count = dto.Count;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
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
