import { TestBed } from '@angular/core/testing';
import { ProductPaginationService } from '../product-pagination.service';
import { Product } from '../../models/product.model';

describe('ProductPaginationService', () => {
  let service: ProductPaginationService;
  let mockProducts: Product[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductPaginationService]
    });
    service = TestBed.inject(ProductPaginationService);

    mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        logo: 'logo1.png',
        date_release: new Date('2023-01-01'),
        date_revision: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        logo: 'logo2.png',
        date_release: new Date('2023-02-01'),
        date_revision: new Date('2024-02-01')
      },
      {
        id: '3',
        name: 'Special Product',
        description: 'Special Description',
        logo: 'logo3.png',
        date_release: new Date('2023-03-01'),
        date_revision: new Date('2024-03-01')
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('paginateAndFilter', () => {
    it('should return first page of results without filtering', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 2);
      
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.items[0].id).toBe('1');
      expect(result.items[1].id).toBe('2');
    });

    it('should return last page of results', () => {
      const result = service.paginateAndFilter(mockProducts, 2, 2);
      
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(3);
      expect(result.currentPage).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(false);
      expect(result.items[0].id).toBe('3');
    });

    it('should handle empty product list', () => {
      const result = service.paginateAndFilter([], 1, 2);
      
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });

    it('should handle page number greater than total pages', () => {
      const result = service.paginateAndFilter(mockProducts, 5, 2);
      
      expect(result.currentPage).toBe(2);
      expect(result.items.length).toBe(1);
    });

    it('should handle page number less than 1', () => {
      const result = service.paginateAndFilter(mockProducts, 0, 2);
      
      expect(result.currentPage).toBe(1);
      expect(result.items.length).toBe(2);
    });

    it('should filter products by name', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 10, 'Special');
      
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe('Special Product');
    });

    it('should filter products by description', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 10, 'Special Description');
      
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.items[0].description).toBe('Special Description');
    });

    it('should handle case-insensitive search', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 10, 'special');
      
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe('Special Product');
    });

    it('should return empty result for non-matching search term', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 10, 'nonexistent');
      
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });

    it('should handle empty search term', () => {
      const result = service.paginateAndFilter(mockProducts, 1, 10, '');
      
      expect(result.items.length).toBe(3);
      expect(result.total).toBe(3);
    });
  });
}); 