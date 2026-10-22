using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Xunit;
using Supermarket.Api.Dtos;

namespace Supermarket.Api.Tests;

public class CheckoutTests
{
    [Fact]
    public async Task Checkout_EmptyCart_ReturnsBadRequest()
    {
        // Arrange: configure the database context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // Simulate an authenticated customer
        var user = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, "test-user-1"),
                    new Claim(ClaimTypes.Role, "User")
                },
                "TestAuthentication"
            )
        );

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = user
            }
        };

        // Create an empty cart
        var request = new CheckoutRequestDto
        {
            Items = new()
        };

        // Act: call the actual checkout action
        var result = await controller.Checkout(request);

        // Assert: verify the returned result
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);

        Assert.Equal(
            "Shopping cart is empty.",
            badRequest.Value
        );
    }
    [Fact]
    public async Task Checkout_ZeroQuantity_ReturnsBadRequest()
    {
        // Arrange: create the test database context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // Simulate an authenticated customer
        var user = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                new Claim(ClaimTypes.NameIdentifier, "test-user-1"),
                new Claim(ClaimTypes.Role, "User")
                },
                "TestAuthentication"
            )
        );

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = user
            }
        };

        // Create a cart containing an invalid quantity
        var request = new CheckoutRequestDto
        {
            Items = new List<CheckoutItemDto>
        {
            new CheckoutItemDto
            {
                ProductId = 1,
                Quantity = 0
            }
        }
        };

        // Act: call the actual checkout action
        var result = await controller.Checkout(request);

        // Assert: verify the returned error
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal("Invalid cart item.", badRequest.Value);
    }
    [Fact]
    public async Task Checkout_InvalidProductId_ReturnsBadRequest()
    {
        // Arrange: create the test database context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // Simulate an authenticated customer
        var user = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                new Claim(ClaimTypes.NameIdentifier, "test-user-1"),
                new Claim(ClaimTypes.Role, "User")
                },
                "TestAuthentication"
            )
        );

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = user
            }
        };

        // Create a cart containing an invalid quantity
        var request = new CheckoutRequestDto
        {
            Items = new List<CheckoutItemDto>
    {
        new CheckoutItemDto
        {
            ProductId = 0,
            Quantity = 2
        }
    }
        };

        // Act: call the actual checkout action
        var result = await controller.Checkout(request);

        // Assert: verify the returned error
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal("Invalid cart item.", badRequest.Value);
    }

    [Fact]
    public async Task Checkout_UnauthenticatedUser_ReturnsUnauthorized()
    {
        // Arrange: create the test database context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // Simulate an unauthenticated user without identity claims
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity()
                )
            }
        };

        // Reject checkout for an unauthenticated user even when the cart contains items
        var request = new CheckoutRequestDto
        {
            Items = new List<CheckoutItemDto>
        {
            new CheckoutItemDto
            {
                ProductId = 1,
                Quantity = 2
            }
        }
        };

        // Act: call the actual checkout action
        var result = await controller.Checkout(request);

        // Assert: verify that the result is 401 Unauthorized
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Checkout_AdminUser_ReturnsForbidden()
    {
        // Arrange: create the test database context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // Simulate an authenticated administrator
        var admin = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                new Claim(ClaimTypes.NameIdentifier, "admin-1"),
                new Claim(ClaimTypes.Role, "Admin")
                },
                "TestAuthentication"
            )
        );

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = admin
            }
        };

        // Prepare the cart
        var request = new CheckoutRequestDto
        {
            Items = new List<CheckoutItemDto>
        {
            new CheckoutItemDto
            {
                ProductId = 1,
                Quantity = 2
            }
        }
        };

        // Act: call the checkout action
        var result = await controller.Checkout(request);

        // Assert: verify that the result is forbidden
        Assert.IsType<ForbidResult>(result);
    }

}