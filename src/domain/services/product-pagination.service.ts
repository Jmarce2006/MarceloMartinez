import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductPaginationService {
  paginateAndFilter(
    products: Product[],
    page: number,
    pageSize: number,
    searchTerm: string = ''
  ): PaginatedResult<Product> {
    // First filter
    let filteredProducts = this.filterProducts(products, searchTerm);

    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const currentPage = Math.min(Math.max(1, page), totalPages || 1);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: filteredProducts.slice(startIndex, endIndex),
      total: filteredProducts.length,
      currentPage,
      pageSize,
      totalPages,
      hasNextPage: endIndex < filteredProducts.length,
    };
  }

  private filterProducts(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm) return products;

    const searchLower = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }
}
