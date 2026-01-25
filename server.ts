import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join } from "path";
import todosRouter from "./routes/todos";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const app = express();
app.use(cors());
app.use(express.json());

// Handle Chrome DevTools well-known endpoint to suppress CSP warnings
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({});
});

// Root endpoint
app.get("/", (req, res) => {
  const htmlPath = join(__dirname, "views", "index.html");
  const html = readFileSync(htmlPath, "utf-8");
  res.send(html);
});

// Routes
app.use("/api/todos", todosRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);

app.listen(3000, () => console.log("API running on port 3000"));
