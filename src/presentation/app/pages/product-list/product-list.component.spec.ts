import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../domain/services/product.service';
import { ProductPaginationService, PaginatedResult } from '../../../../domain/services/product-pagination.service';
import { of, throwError } from 'rxjs';
import { Product } from '../../../../domain/models/product.model';
import { BackendError } from '../../../../domain/errors/backend-error';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jest.Mocked<ProductService>;
  let paginationService: jest.Mocked<ProductPaginationService>;

  const mockProducts: Product[] = [
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
      name: 'Product 3', 
      description: 'Description 3', 
      logo: 'logo3.png',
      date_release: new Date('2023-03-01'),
      date_revision: new Date('2024-03-01')
    }
  ];

  beforeEach(async () => {
    const productServiceMock = {
      getProducts: jest.fn(),
      deleteProduct: jest.fn(),
    };
    const paginationServiceMock = {
      paginateAndFilter: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: ProductPaginationService, useValue: paginationServiceMock }
      ]
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    paginationService = TestBed.inject(ProductPaginationService) as jest.Mocked<ProductPaginationService>;

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Arrange
    // No arrangement needed for this simple test

    // Act
    // Component is already created in beforeEach

    // Assert
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    // Arrange
    productService.getProducts.mockReturnValue(of(mockProducts));
    paginationService.paginateAndFilter.mockReturnValue({
      items: mockProducts,
      total: mockProducts.length,
      currentPage: 1,
      pageSize: component.pageSize,
      totalPages: 1,
      hasNextPage: false
    });

    // Act
    fixture.detectChanges();

    // Assert
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.allProducts).toEqual(mockProducts);
    expect(component.products).toEqual(mockProducts);
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle error when loading products', () => {
    // Arrange
    const error = new BackendError('Failed to load products');
    productService.getProducts.mockReturnValue(throwError(() => error));
    paginationService.paginateAndFilter.mockReturnValue({
      items: [],
      total: 0,
      currentPage: 1,
      pageSize: component.pageSize,
      totalPages: 0,
      hasNextPage: false
    });

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.errorMessage).toBe('Failed to load products');
    expect(component.allProducts).toEqual([]);
    expect(component.products).toEqual([]);
    expect(component.isLoading).toBeFalsy();
  });

  it('should update paginated data when search term changes', () => {
    // Arrange
    component.allProducts = mockProducts;
    const searchTerm = 'Product 1';
    
    paginationService.paginateAndFilter.mockReturnValue({
      items: [mockProducts[0]],
      total: 1,
      currentPage: 1,
      pageSize: component.pageSize,
      totalPages: 1,
      hasNextPage: false
    });

    // Act
    component.onSearch(searchTerm);

    // Assert
    expect(component.searchTerm).toBe(searchTerm);
    expect(component.currentPage).toBe(1);
    expect(paginationService.paginateAndFilter).toHaveBeenCalledWith(
      mockProducts,
      1,
      component.pageSize,
      searchTerm
    );
  });

  it('should update paginated data when page changes', () => {
    // Arrange
    component.allProducts = mockProducts;
    
    // Set up initial paginated data
    paginationService.paginateAndFilter.mockReturnValueOnce({
      items: mockProducts.slice(0, 2),
      total: mockProducts.length,
      currentPage: 1,
      pageSize: 2,
      totalPages: 2,
      hasNextPage: true
    });

    // Update component state
    component.pageSize = 2;
    component.updatePaginatedData();

    // Prepare for page change
    const newPage = 2;
    paginationService.paginateAndFilter.mockReturnValueOnce({
      items: mockProducts.slice(2),
      total: mockProducts.length,
      currentPage: newPage,
      pageSize: 2,
      totalPages: 2,
      hasNextPage: false
    });

    // Act
    component.onPageChange(newPage);

    // Assert
    expect(component.currentPage).toBe(newPage);
    expect(paginationService.paginateAndFilter).toHaveBeenCalledWith(
      mockProducts,
      newPage,
      2,
      component.searchTerm
    );
  });

  it('should update paginated data when page size changes', () => {
    // Arrange
    component.allProducts = mockProducts;
    const newPageSize = 10;
    
    paginationService.paginateAndFilter.mockReturnValue({
      items: mockProducts,
      total: mockProducts.length,
      currentPage: 1,
      pageSize: newPageSize,
      totalPages: 1,
      hasNextPage: false
    });

    // Act
    component.onPageSizeChange(newPageSize);

    // Assert
    expect(component.pageSize).toBe(newPageSize);
    expect(component.currentPage).toBe(1);
    expect(paginationService.paginateAndFilter).toHaveBeenCalledWith(
      mockProducts,
      1,
      newPageSize,
      component.searchTerm
    );
  });

  it('should not change page if new page is invalid', () => {
    // Arrange
    component.allProducts = mockProducts;
    const initialPage = component.currentPage;
    const invalidPage = 0;
    
    // Act
    component.onPageChange(invalidPage);

    // Assert
    expect(component.currentPage).toBe(initialPage);
    expect(paginationService.paginateAndFilter).not.toHaveBeenCalled();
  });
  describe('Delete Product', () => {
    it('should delete product successfully', fakeAsync(() => {
      // Arrange
      component.allProducts = mockProducts;
      const productToDelete = mockProducts[0];
      const remainingProducts = mockProducts.slice(1);
      
      productService.deleteProduct.mockReturnValue(of(void 0));
      productService.getProducts.mockReturnValue(of(remainingProducts));
      
      paginationService.paginateAndFilter.mockReturnValue({
        items: remainingProducts,
        total: remainingProducts.length,
        currentPage: 1,
        pageSize: component.pageSize,
        totalPages: 1,
        hasNextPage: false
      });

      // Act
      component.onDelete(productToDelete);
      component.onConfirmDelete();
      tick();

      // Assert
      expect(productService.deleteProduct).toHaveBeenCalledWith(productToDelete.id);
      expect(component.showDeleteModal).toBe(false);
      expect(component.productToDelete).toBeNull();
      expect(component.allProducts).toEqual(remainingProducts);
    }));

    it('should not delete product when user cancels confirmation', fakeAsync(() => {
      // Arrange
      component.allProducts = mockProducts;
      const productToDelete = mockProducts[0];

      // Act
      component.onDelete(productToDelete);
      component.onCancelDelete();
      tick();

      // Assert
      expect(productService.deleteProduct).not.toHaveBeenCalled();
      expect(component.showDeleteModal).toBe(false);
      expect(component.productToDelete).toBeNull();
      expect(component.allProducts).toEqual(mockProducts);
    }));

    it('should handle delete error', fakeAsync(() => {
      // Arrange
      component.allProducts = mockProducts;
      const productToDelete = mockProducts[0];
      const error = { message: 'Error deleting product' };
      productService.deleteProduct.mockReturnValue(throwError(() => error));

      // Act
      component.onDelete(productToDelete);
      component.onConfirmDelete();
      tick();

      // Assert
      expect(productService.deleteProduct).toHaveBeenCalledWith(productToDelete.id);
      expect(component.errorMessage).toBe('Error deleting product');
      expect(component.isLoading).toBe(false);
      expect(component.allProducts).toEqual(mockProducts);
    }));
  });
}); 