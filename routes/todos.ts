import { Router } from "express";

const router = Router();

// Todo interface
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// In-memory storage
let todos: Todo[] = [{ id: 1, title: "Learn Angular", completed: false }];

// Get all todos
router.get("/", (req, res) => {
  res.json(todos);
});

// Create a new todo
router.post("/", (req, res) => {
  const newTodo: Todo = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Not found" });
  }

  todo.title = req.body.title;
  todo.completed = req.body.completed;
  res.json(todo);
});

// Delete a todo
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((t) => t.id !== id);
  res.json({ success: true });
});

export default router;
