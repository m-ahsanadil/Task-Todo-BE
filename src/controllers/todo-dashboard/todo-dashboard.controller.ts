import { Request, Response } from "express";
import { Todo } from "../../models/todo.models";
import ApiError from "../../utils/api-error";
import ApiResponse from "../../utils/api-response";
import { MESSAGES } from "../../utils/message-codes";
import { getRepository } from "typeorm";


export class TodoDashboardController {
  static async getUserTodos(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      if (!userId) {
        return res.status(MESSAGES.UNAUTHORIZED._CODE).json({
          error: new ApiError(
            MESSAGES.UNAUTHORIZED._CODE,
            null,
            "Unauthorized: User ID missing"
          ),
        });
      }

      const todoRepository = getRepository(Todo);
      const todos = await todoRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" },
      });

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(
          MESSAGES.SUCCESS._CODE,
          todos,
          "User todos retrieved successfully"
        )
      );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error retrieving todos"
        ),
      });
    }
  }
  static async createTodo(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { title, description } = req.body;

      if (!title) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "Title is required"
          ),
        });
      }

      const todoRepository = getRepository(Todo);
      const todo = todoRepository.create({
        title,
        description,
        user: { id: userId },
        isCompleted: false,
      });

      await todoRepository.save(todo);

      return res.status(MESSAGES.CREATED._CODE).json(
        new ApiResponse(
          MESSAGES.CREATED._CODE,
          todo,
          "Todo created successfully"
        )
      );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error creating todo"
        ),
      });
    }
  }

  static async updateTodo(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;
      const { title, description, isCompleted } = req.body;

      const todoRepository = getRepository(Todo);
      const todo = await todoRepository.findOne({
        where: { id: Number(id), user: { id: userId } },
      });

      if (!todo) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Todo not found"
          ),
        });
      }

      if (title !== undefined) todo.title = title;
      if (description !== undefined) todo.description = description;
      if (isCompleted !== undefined) todo.isCompleted = isCompleted;

      await todoRepository.save(todo);

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(
          MESSAGES.SUCCESS._CODE,
          todo,
          "Todo updated successfully"
        )
      );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error updating todo"
        ),
      });
    }
  }

  static async deleteTodo(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { id } = req.params;

      const todoRepository = getRepository(Todo);
      const todo = await todoRepository.findOne({
        where: { id: Number(id), user: { id: userId } },
      });

      if (!todo) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Todo not found"
          ),
        });
      }

      await todoRepository.remove(todo);

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(
          MESSAGES.SUCCESS._CODE,
          null,
          "Todo deleted successfully"
        )
      );
    } catch (error) {
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          "Error deleting todo"
        ),
      });
    }
  }
}
