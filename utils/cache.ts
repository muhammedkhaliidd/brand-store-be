// Simple in-memory cache utility
class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default TTL: 5 minutes
    this.defaultTTL = defaultTTL;
  }

  // Get value from cache
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Set value in cache
  set(key: string, value: T, ttl?: number): void {
    const timestamp = Date.now();
    this.cache.set(key, { data: value, timestamp });

    // If custom TTL provided, schedule deletion
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl);
    }
  }

  // Delete specific key from cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instances for different data types
export const productsCache = new Cache<any[]>(10 * 60 * 1000); // 10 minutes TTL for products
export const productCache = new Cache<any>(10 * 60 * 1000); // 10 minutes TTL for single product

export default Cache;
