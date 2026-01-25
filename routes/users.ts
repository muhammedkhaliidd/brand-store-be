import { Router } from "express";
import { Storage } from "../utils/storage";
import { randomBytes } from "crypto";

const router = Router();

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  image?: string;
}

// Internal user storage (includes password)
interface UserWithPassword extends User {
  password: string;
}

// Persistent storage for users
const userStorage = new Storage<UserWithPassword>("users.json", []);

// Helper function to generate a unique token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Helper function to generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// POST /register - Register a new user
router.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  // Validation
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ message: "Email is required and must be a string" });
  }
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Name is required and must be a string" });
  }
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Password is required and must be a string" });
  }

  // Check if user with this email already exists
  const existingUsers = userStorage.getAll();
  const existingUser = existingUsers.find((u) => u.email === email);
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User with this email already exists" });
  }

  // Create new user
  const userId = generateId();
  const token = generateToken();

  const newUser: UserWithPassword = {
    id: userId,
    name,
    email,
    password, // TODO: Hash password before storing (use bcrypt in production)
    token,
  };

  // Save to persistent storage
  userStorage.add(newUser);

  // Return user without password
  const { password: _, ...userResponse } = newUser;
  res.status(201).json(userResponse);
});

// POST /login - Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ message: "Email is required and must be a string" });
  }
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Password is required and must be a string" });
  }

  // Find user by email
  const users = userStorage.getAll();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Check password (TODO: Use bcrypt.compare in production)
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate new token for this session
  const token = generateToken();
  user.token = token;

  // Update user in storage
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    userStorage.setAll(users);
  }

  // Return user without password
  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

export default router;
