import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Handle Chrome DevTools well-known endpoint to suppress CSP warnings
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({});
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Todo API Server 37",
    endpoints: {
      "GET /api/todos": "Get all todos",
      "POST /api/todos": "Create a new todo",
      "PUT /api/todos/:id": "Update a todo",
      "DELETE /api/todos/:id": "Delete a todo",
    },
  });
});

let todos = [{ id: 1, title: "Learn Angular", completed: false }];

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
  };
  todos.push(newTodo);
  res.json(newTodo);
});

app.put("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ message: "Not found" });

  todo.title = req.body.title;
  todo.completed = req.body.completed;
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  todos = todos.filter((t) => t.id !== id);
  res.json({ success: true });
});

app.listen(3000, () => console.log("API running on port 3000"));
