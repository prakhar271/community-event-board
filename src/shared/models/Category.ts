export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string; // for hierarchical categories
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  eventCount?: number;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId?: string;
  icon: string;
  color: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
}