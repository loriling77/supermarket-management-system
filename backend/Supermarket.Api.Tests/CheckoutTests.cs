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
        // Arrange: 创建 DbContext 配置
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // 模拟已登录的普通用户
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

        // 创建空购物车
        var request = new CheckoutRequestDto
        {
            Items = new()
        };

        // Act: 调用真正的 Checkout 方法
        var result = await controller.Checkout(request);

        // Assert: 检查返回结果
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
        // Arrange: 创建测试用的 DbContext
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // 模拟已登录的普通用户
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

        // 创建包含无效数量的购物车
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

        // Act: 调用真正的 Checkout
        var result = await controller.Checkout(request);

        // Assert: 检查返回的错误
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal("Invalid cart item.", badRequest.Value);
    }
    [Fact]
    public async Task Checkout_InvalidProductId_ReturnsBadRequest()
    {
        // Arrange: 创建测试用的 DbContext
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // 模拟已登录的普通用户
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

        // 创建包含无效数量的购物车
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

        // Act: 调用真正的 Checkout
        var result = await controller.Checkout(request);

        // Assert: 检查返回的错误
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal("Invalid cart item.", badRequest.Value);
    }

    [Fact]
    public async Task Checkout_UnauthenticatedUser_ReturnsUnauthorized()
    {
        // Arrange: 创建测试用的 DbContext
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // 模拟未登录用户：没有任何身份信息
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity()
                )
            }
        };

        // 即使购物车有商品，未登录也不能结账
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

        // Act: 调用真正的 Checkout 方法
        var result = await controller.Checkout(request);

        // Assert: 检查是否返回 401 Unauthorized
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Checkout_AdminUser_ReturnsForbidden()
    {
        // Arrange: 创建测试用 DbContext
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(
                "Server=127.0.0.1,1;Database=TestDb;" +
                "User Id=test;Password=test-only;" +
                "Connect Timeout=1;Encrypt=False")
            .Options;

        await using var context = new AppDbContext(options);

        var controller = new OrderController(context);

        // 模拟已经登录的管理员
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

        // 准备购物车
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

        // Act: 调用 Checkout
        var result = await controller.Checkout(request);

        // Assert: 检查是否返回 ForbidResult
        Assert.IsType<ForbidResult>(result);
    }

}