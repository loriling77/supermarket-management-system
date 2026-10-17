using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Supermarket.Api.Controllers;
using System.Data;
using Supermarket.Api.Dtos;

namespace Supermarket.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoryController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
            return category;

        }

        [HttpPost]
        public async Task<ActionResult<Category>> AddCategory(CategoryRequestDto dto)
        {
            var category = new Category
            {
                CategoryName = dto.CategoryName,
                Detail = dto.Detail
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.Id },
                category
            );
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Category>> UpdateCategory(int id, CategoryRequestDto dto)
        {


            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return NotFound();
            category.CategoryName = dto.CategoryName;
            category.Detail = dto.Detail;

            await _context.SaveChangesAsync();
            return NoContent();


        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Category>> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }



    }
}
