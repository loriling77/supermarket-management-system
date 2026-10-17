
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Data;
using Supermarket.Api.Dtos;

namespace Supermarket.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/user
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(user => new UserResponseDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email
            })
            .ToListAsync();

        return Ok(users);
    }
}
