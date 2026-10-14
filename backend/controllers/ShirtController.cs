using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GameStore.Api.controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShirtController : ControllerBase
    {
        [HttpGet]
        public string GetShirts()
        {
            return "get all shirts";
        }
        [HttpGet("{id}")]
        public string GetOneShirt(int id)
        {
            return $"get {id} shirts";
        }
        [HttpPost]
        public string PostShirt()
        {
            return "post a shirt";
        }
        [HttpDelete("{id}")]
        public string DeleteShirt(int id)
        {
            return $"delete a{id} shirts";
        }

        [HttpPut("{id}")]
        public string PutShirt(int id)
        {
            return $"put a{id} shirts";
        }


    }
}
