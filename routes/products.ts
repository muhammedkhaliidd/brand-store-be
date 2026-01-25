import { Router } from "express";
import { productsCache, productCache } from "../utils/cache";
import { Storage } from "../utils/storage";

const router = Router();

// Product interface
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

// Persistent storage - loads from file on startup, saves on every change
const productStorage = new Storage<Product>("products.json", [
  {
    id: 1,
    name: "Sample Product",
    price: 29.99,
    description: "This is a sample product",
    image: "https://picsum.photos/150/150",
  },
  {
    id: 2,
    name: "Sample Product 2",
    price: 39.99,
    description: "This is a sample product 2",
    image: "https://picsum.photos/150/150",
  },
]);

// Get all products
router.get("/", (req, res) => {
  const cacheKey = "all_products";

  // Check cache first
  const cachedProducts = productsCache.get(cacheKey);
  if (cachedProducts) {
    console.log("✅ Serving products from cache");
    return res.json(cachedProducts);
  }

  // If not in cache, fetch from persistent storage and cache it
  const products = productStorage.getAll();
  console.log("📦 Fetching products from persistent storage and caching");
  productsCache.set(cacheKey, products);
  res.json(products);
});

// Get a single product by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const cacheKey = `product_${id}`;

  // Check cache first
  const cachedProduct = productCache.get(cacheKey);
  if (cachedProduct) {
    console.log(`✅ Serving product ${id} from cache`);
    return res.json(cachedProduct);
  }

  // If not in cache, fetch from persistent storage
  const product = productStorage.getById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Cache the product
  console.log(`📦 Fetching product ${id} from persistent storage and caching`);
  productCache.set(cacheKey, product);
  res.json(product);
});

// Create a new product
router.post("/", (req, res) => {
  const { name, price, description, image } = req.body;

  // Validation
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Name is required and must be a string" });
  }
  if (price === undefined || typeof price !== "number" || price < 0) {
    return res
      .status(400)
      .json({ message: "Price is required and must be a positive number" });
  }

  const newProduct: Product = {
    id: Date.now(),
    name,
    price,
    description: description || undefined,
    image: image || undefined,
  };

  // Save to persistent storage (automatically saves to file)
  productStorage.add(newProduct);

  // Invalidate cache when new product is added
  productsCache.delete("all_products");
  console.log("🗑️ Cache invalidated: all_products");

  res.status(201).json(newProduct);
});

// Update a product
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, price, description, image } = req.body;

  // Validation
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "Name must be a string" });
  }
  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    return res.status(400).json({ message: "Price must be a positive number" });
  }

  // Prepare updates
  const updates: Partial<Product> = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price;
  if (description !== undefined) updates.description = description || undefined;
  if (image !== undefined) updates.image = image || undefined;

  // Update in persistent storage (automatically saves to file)
  const updatedProduct = productStorage.update(id, updates);
  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Invalidate cache for this product and all products list
  productCache.delete(`product_${id}`);
  productsCache.delete("all_products");
  console.log(`🗑️ Cache invalidated: product_${id} and all_products`);

  res.json(updatedProduct);
});

// Delete a product
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  // Delete from persistent storage (automatically saves to file)
  const deleted = productStorage.delete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Invalidate cache for this product and all products list
  productCache.delete(`product_${id}`);
  productsCache.delete("all_products");
  console.log(`🗑️ Cache invalidated: product_${id} and all_products`);

  res.json({ success: true, message: "Product deleted" });
});

// update all products
router.put("/", (req, res) => {
  const { products } = req.body;
  productStorage.updateAll(products);
  res.json({ success: true, message: "Products updated" });
});

export default router;
