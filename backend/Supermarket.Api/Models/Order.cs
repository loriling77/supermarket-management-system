using System;

namespace Supermarket.Api.Models;

public class Order
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Count { get; set; }

    public DateTime Created_date { get; set; }
    public DateTime Created_time { get; set; }


}
