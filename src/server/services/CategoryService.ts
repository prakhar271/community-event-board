import { db } from '../config/database';
import { logger } from '../config/logger';
import { cacheService } from './CacheService';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
  eventCount?: number;
}

export class CategoryService {
  private readonly CACHE_TTL = 3600; // 1 hour

  // Get all categories with hierarchy
  async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    try {
      const cacheKey = `categories:all:${includeInactive}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const whereClause = includeInactive ? '' : 'WHERE is_active = true';
      const result = await db.query(`
        SELECT c.*,
               COUNT(e.id) as event_count
        FROM categories c
        LEFT JOIN events e ON c.name = e.category AND e.status = 'published'
        ${whereClause}
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
      `);

      const categories = this.buildCategoryHierarchy(result.rows);
      cacheService.set(cacheKey, categories, this.CACHE_TTL);

      return categories;
    } catch (error) {
      logger.error('Failed to get all categories', error as Error);
      throw new Error('Failed to get categories');
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const cacheKey = `category:${id}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await db.query(`
        SELECT c.*,
               COUNT(e.id) as event_count
        FROM categories c
        LEFT JOIN events e ON c.name = e.category AND e.status = 'published'
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const category = result.rows[0];
      cacheService.set(cacheKey, category, this.CACHE_TTL);

      return category;
    } catch (error) {
      logger.error('Failed to get category by ID', error as Error, { id });
      throw new Error('Failed to get category');
    }
  }

  // Create new category
  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
  }): Promise<Category> {
    try {
      // Check if category name already exists
      const existing = await db.query(`
        SELECT id FROM categories WHERE LOWER(name) = LOWER($1)
      `, [data.name]);

      if (existing.rows.length > 0) {
        throw new Error('Category name already exists');
      }

      // Validate parent category if provided
      if (data.parentId) {
        const parent = await this.getCategoryById(data.parentId);
        if (!parent) {
          throw new Error('Parent category not found');
        }
      }

      const result = await db.query(`
        INSERT INTO categories (name, description, parent_id, icon, color, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.name,
        data.description,
        data.parentId,
        data.icon,
        data.color,
        data.sortOrder || 0
      ]);

      const category = result.rows[0];
      
      // Clear cache
      this.clearCategoryCache();

      logger.info('Category created', {
        categoryId: category.id,
        name: data.name,
        parentId: data.parentId
      });

      return category;
    } catch (error) {
      logger.error('Failed to create category', error as Error, data);
      throw error;
    }
  }

  // Update category
  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<Category> {
    try {
      // Check if category exists
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new Error('Category not found');
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== existing.name) {
        const nameCheck = await db.query(`
          SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2
        `, [data.name, id]);

        if (nameCheck.rows.length > 0) {
          throw new Error('Category name already exists');
        }
      }

      // Validate parent category if provided
      if (data.parentId && data.parentId !== existing.parentId) {
        if (data.parentId === id) {
          throw new Error('Category cannot be its own parent');
        }
        
        const parent = await this.getCategoryById(data.parentId);
        if (!parent) {
          throw new Error('Parent category not found');
        }
      }

      // Build update query
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          updateFields.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      updateFields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await db.query(`
        UPDATE categories 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      const category = result.rows[0];
      
      // Clear cache
      this.clearCategoryCache();

      logger.info('Category updated', {
        categoryId: id,
        updatedFields: Object.keys(data)
      });

      return category;
    } catch (error) {
      logger.error('Failed to update category', error as Error, { id, data });
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category exists
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category has events
      const eventCheck = await db.query(`
        SELECT COUNT(*) as count FROM events WHERE category = $1
      `, [category.name]);

      if (parseInt(eventCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete category with existing events');
      }

      // Check if category has children
      const childrenCheck = await db.query(`
        SELECT COUNT(*) as count FROM categories WHERE parent_id = $1
      `, [id]);

      if (parseInt(childrenCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      // Delete category
      await db.query(`DELETE FROM categories WHERE id = $1`, [id]);
      
      // Clear cache
      this.clearCategoryCache();

      logger.info('Category deleted', { categoryId: id, name: category.name });
    } catch (error) {
      logger.error('Failed to delete category', error as Error, { id });
      throw error;
    }
  }

  // Get popular categories
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    try {
      const cacheKey = `categories:popular:${limit}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await db.query(`
        SELECT c.*,
               COUNT(e.id) as event_count
        FROM categories c
        LEFT JOIN events e ON c.name = e.category AND e.status = 'published'
        WHERE c.is_active = true
        GROUP BY c.id
        HAVING COUNT(e.id) > 0
        ORDER BY COUNT(e.id) DESC, c.name ASC
        LIMIT $1
      `, [limit]);

      const categories = result.rows;
      cacheService.set(cacheKey, categories, this.CACHE_TTL);

      return categories;
    } catch (error) {
      logger.error('Failed to get popular categories', error as Error);
      throw new Error('Failed to get popular categories');
    }
  }

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const result = await db.query(`
        SELECT c.*,
               COUNT(e.id) as event_count
        FROM categories c
        LEFT JOIN events e ON c.name = e.category AND e.status = 'published'
        WHERE c.is_active = true 
          AND (c.name ILIKE $1 OR c.description ILIKE $1)
        GROUP BY c.id
        ORDER BY c.name ASC
      `, [`%${query}%`]);

      return result.rows;
    } catch (error) {
      logger.error('Failed to search categories', error as Error, { query });
      throw new Error('Failed to search categories');
    }
  }

  // Build category hierarchy
  private buildCategoryHierarchy(categories: any[]): Category[] {
    const categoryMap = new Map();
    const rootCategories: Category[] = [];

    // First pass: create category objects
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        children: []
      });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  // Clear category cache
  private clearCategoryCache(): void {
    // Clear all category-related cache keys
    const keys = ['categories:all:true', 'categories:all:false'];
    keys.forEach(key => cacheService.delete(key));
    
    // Clear popular categories cache
    for (let i = 1; i <= 20; i++) {
      cacheService.delete(`categories:popular:${i}`);
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<any> {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_categories,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
          COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as root_categories
        FROM categories
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get category stats', error as Error);
      throw new Error('Failed to get category statistics');
    }
  }
}