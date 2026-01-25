import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Storage utility for persisting data to JSON file
export class Storage<T> {
  private filePath: string;
  private data: T[];

  constructor(fileName: string, defaultData: T[] = []) {
    this.filePath = join(__dirname, "..", "data", fileName);
    this.data = this.load(defaultData);
  }

  // Load data from file, or return default if file doesn't exist
  private load(defaultData: T[]): T[] {
    try {
      if (existsSync(this.filePath)) {
        const fileContent = readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        console.log(`✅ Loaded data from ${this.filePath}`);
        return Array.isArray(parsed) ? parsed : defaultData;
      } else {
        console.log(`📝 Creating new data file: ${this.filePath}`);
        // Create directory if it doesn't exist
        const dirPath = join(__dirname, "..", "data");
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
        // Save default data
        this.save(defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error(`❌ Error loading data from ${this.filePath}:`, error);
      return defaultData;
    }
  }

  // Save data to file
  private save(data: T[]): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`💾 Data saved to ${this.filePath}`);
    } catch (error) {
      console.error(`❌ Error saving data to ${this.filePath}:`, error);
    }
  }

  // Get all data
  getAll(): T[] {
    return this.data;
  }

  // Get data by id
  getById(id: number): T | undefined {
    return this.data.find((item: any) => item.id === id);
  }

  // Add new item
  add(item: T): T {
    this.data.push(item);
    this.save(this.data);
    return item;
  }

  // Update item by id
  update(id: number, updates: Partial<T>): T | null {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) {
      return null;
    }

    this.data[index] = { ...this.data[index], ...updates };
    this.save(this.data);
    return this.data[index];
  }

  // Update all items
  updateAll(items: T[]): T[] {
    this.data = items;
    this.save(this.data);
    return this.data;
  }

  // Delete item by id
  delete(id: number): boolean {
    const initialLength = this.data.length;
    this.data = this.data.filter((item: any) => item.id !== id);

    if (this.data.length < initialLength) {
      this.save(this.data);
      return true;
    }
    return false;
  }

  // Replace all data (useful for bulk operations)
  setAll(data: T[]): void {
    this.data = data;
    this.save(this.data);
  }
}
