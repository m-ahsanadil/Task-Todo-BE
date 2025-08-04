using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoAPI.DTOs;
using TodoAPI.Services;

namespace TodoAPI.Controllers
{
    [ApiController]
    [Route("api/v1/todos")]
    [Authorize]
    public class TodosController : ControllerBase
    {
        private readonly ITodoService _todoService;

        public TodosController(ITodoService todoService)
        {
            _todoService = todoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserTodos()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Invalid token" });

                var todos = await _todoService.GetUserTodosAsync(userId.Value);

                if (todos == null || !todos.Any())
                    return NotFound(new { message = "No todos found" });
                    
                return Ok(new { message = "Todos retrieved successfully", data = todos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTodoById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Invalid token" });

                var todo = await _todoService.GetTodoByIdAsync(id, userId.Value);
                if (todo == null)
                    return NotFound(new { message = "Todo not found" });

                return Ok(new { message = "Todo retrieved successfully", data = todo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] CreateTodoDto createTodoDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Invalid token" });
                Console.WriteLine($"Creating todo for userId: {userId}, title: {createTodoDto.Title}");

                var todo = await _todoService.CreateTodoAsync(createTodoDto, userId.Value);
                Console.WriteLine($"Todo created with ID: {todo.Id}");

                return CreatedAtAction(nameof(GetTodoById), new { id = todo.Id },
                    new { message = "Todo created successfully", data = todo });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");

                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(int id, [FromBody] UpdateTodoDto updateTodoDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Invalid token" });

                var todo = await _todoService.UpdateTodoAsync(id, updateTodoDto, userId.Value);
                if (todo == null)
                    return NotFound(new { message = "Todo not found" });

                if (todo == null)
                    return NotFound(new { message = $"Todo with ID {id} not found" });

                return Ok(new { message = "Todo updated successfully", data = todo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Invalid token" });

                var result = await _todoService.DeleteTodoAsync(id, userId.Value);
                if (!result)
                    return NotFound(new { message = "Todo not found" });

                return Ok(new { message = "Todo deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null && int.TryParse(userIdClaim, out int userId) ? userId : null;
        }
    }
}