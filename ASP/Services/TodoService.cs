using Microsoft.EntityFrameworkCore;
using TodoAPI.Data;
using TodoAPI.DTOs;
using TodoAPI.Models;

namespace TodoAPI.Services
{
    public interface ITodoService
    {
        Task<List<TodoResponseDto>> GetUserTodosAsync(int userId);
        Task<TodoResponseDto?> GetTodoByIdAsync(int todoId, int userId);
        Task<TodoResponseDto> CreateTodoAsync(CreateTodoDto createTodoDto, int userId);
        Task<TodoResponseDto?> UpdateTodoAsync(int todoId, UpdateTodoDto updateTodoDto, int userId);
        Task<bool> DeleteTodoAsync(int todoId, int userId);
    }

    public class TodoService : ITodoService
    {
        private readonly ApplicationDbContext _context;

        public TodoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TodoResponseDto>> GetUserTodosAsync(int userId)
        {
            var todos = await _context.Todos
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return todos.Select(MapToDto).ToList();
        }

        public async Task<TodoResponseDto?> GetTodoByIdAsync(int todoId, int userId)
        {
            var todo = await _context.Todos
                .FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);

            return todo == null ? null : MapToDto(todo);
        }

        public async Task<TodoResponseDto> CreateTodoAsync(CreateTodoDto createTodoDto, int userId)
        {

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                throw new ArgumentException("User does not exist.");
            }

            var exists = await _context.Todos.AnyAsync(t => t.UserId == userId && t.Title == createTodoDto.Title);
            if (exists)
            {
                throw new InvalidOperationException("Todo with this title already exists.");
            }

            var todo = new Todo
            {
                Title = createTodoDto.Title,
                Description = createTodoDto.Description,
                UserId = userId,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            return MapToDto(todo);
        }

        public async Task<TodoResponseDto?> UpdateTodoAsync(int todoId, UpdateTodoDto updateTodoDto, int userId)
        {

            if (todoId <= 0)
                throw new ArgumentException("Invalid Todo ID"); ;

            var todo = await _context.Todos
                .FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);

            if (todo == null) return null;

            if (!string.IsNullOrEmpty(updateTodoDto.Title))
                todo.Title = updateTodoDto.Title;

            if (updateTodoDto.Description != null)
                todo.Description = updateTodoDto.Description;

            if (updateTodoDto.IsCompleted.HasValue)
                todo.IsCompleted = updateTodoDto.IsCompleted.Value;

            await _context.SaveChangesAsync();
            return MapToDto(todo);
        }

        public async Task<bool> DeleteTodoAsync(int todoId, int userId)
        {
            if (todoId <= 0)
                throw new ArgumentException("Invalid Todo ID");

            var todo = await _context.Todos
                .FirstOrDefaultAsync(t => t.Id == todoId && t.UserId == userId);

            if (todo == null) return false;

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
            return true;
        }

        private static TodoResponseDto MapToDto(Todo todo)
        {
            return new TodoResponseDto
            {
                Id = todo.Id,
                UserId = todo.UserId,
                Title = todo.Title,
                Description = todo.Description,
                IsCompleted = todo.IsCompleted,
                CreatedAt = todo.CreatedAt
            };
        }
    }
}