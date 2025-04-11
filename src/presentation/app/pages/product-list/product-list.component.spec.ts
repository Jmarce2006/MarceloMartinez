import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../domain/services/product.service';
import { ProductPaginationService, PaginatedResult } from '../../../../domain/services/product-pagination.service';
import { of, throwError } from 'rxjs';
import { Product } from '../../../../domain/models/product.model';
import { BackendError } from '../../../../domain/errors/backend-error';
import { Router } from '@angular/router';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jest.Mocked<ProductService>;
  let paginationService: jest.Mocked<ProductPaginationService>;
  let router: jest.Mocked<Router>;

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
    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: ProductPaginationService, useValue: paginationServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    paginationService = TestBed.inject(ProductPaginationService) as jest.Mocked<ProductPaginationService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

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

  it('should not change page when invalid page number is provided', () => {
    // Arrange
    const initialPage = component.currentPage;
    component.paginatedData = {
      items: mockProducts,
      total: mockProducts.length,
      currentPage: initialPage,
      pageSize: component.pageSize,
      totalPages: 2,
      hasNextPage: true
    };

    // Act
    component.onPageChange(-1);
    
    // Assert
    expect(component.currentPage).toBe(initialPage);
    
    // Act
    component.onPageChange(1000);
    
    // Assert
    expect(component.currentPage).toBe(initialPage);
  });

  it('should handle menu toggling correctly', () => {
    // Arrange
    const productId = '1';
    const event = new Event('click');
    const button = document.createElement('button');
    button.className = 'menu-button';
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-container';
    const dropdown = document.createElement('div');
    dropdown.className = 'menu-dropdown';
    menuContainer.appendChild(button);
    menuContainer.appendChild(dropdown);
    document.body.appendChild(menuContainer);
    Object.defineProperty(event, 'target', { value: button });
    Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

    // Act - Toggle menu on
    component.toggleMenu(productId, event);

    // Assert
    expect(component.activeMenuId).toBe(productId);
    expect(event.stopPropagation).toHaveBeenCalled();

    // Act - Toggle menu off
    component.toggleMenu(productId, event);

    // Assert
    expect(component.activeMenuId).toBeNull();

    // Cleanup
    document.body.removeChild(menuContainer);
  });

  it('should close menu when clicking outside menu container', () => {
    // Arrange
    component.activeMenuId = 'test-id';
    const event = new MouseEvent('click');
    const target = document.createElement('div');
    jest.spyOn(target, 'closest').mockReturnValue(null);
    Object.defineProperty(event, 'target', { value: target });

    // Act
    component.onDocumentClick(event);

    // Assert
    expect(component.activeMenuId).toBeNull();
  });

  it('should not close menu when clicking inside menu container', () => {
    // Arrange
    component.activeMenuId = 'test-id';
    const event = new MouseEvent('click');
    const target = document.createElement('div');
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-container';
    jest.spyOn(target, 'closest').mockReturnValue(menuContainer);
    Object.defineProperty(event, 'target', { value: target });

    // Act
    component.onDocumentClick(event);

    // Assert
    expect(component.activeMenuId).toBe('test-id');
  });

  it('should handle delete confirmation successfully', () => {
    // Arrange
    const product = { id: '1', name: 'Test Product' } as Product;
    component.productToDelete = product;
    productService.deleteProduct.mockReturnValue(of(undefined));
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
    component.onConfirmDelete();

    // Assert
    expect(productService.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBeNull();
    expect(productService.getProducts).toHaveBeenCalled();
  });

  it('should handle delete confirmation error', () => {
    // Arrange
    const product = { id: '1', name: 'Test Product' } as Product;
    component.productToDelete = product;
    const error = new BackendError('Delete failed');
    productService.deleteProduct.mockReturnValue(throwError(() => error));

    // Act
    component.onConfirmDelete();

    // Assert
    expect(productService.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.errorMessage).toBe('Delete failed');
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBe(product);
  });

  it('should handle image error', () => {
    // Arrange
    const event = new Event('error');
    const imgElement = document.createElement('img');
    const fallbackElement = document.createElement('div');
    imgElement.insertAdjacentElement('afterend', fallbackElement);
    Object.defineProperty(event, 'target', { value: imgElement });

    // Act
    component.handleImageError(event);

    // Assert
    expect(imgElement.style.display).toBe('none');
  });

  it('should navigate to edit page', () => {
    // Arrange
    const product = { id: '1', name: 'Test Product' } as Product;
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Act
    component.onEdit(product);

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/products/edit', product.id]);
  });

  it('should navigate to add product page', () => {
    // Arrange
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Act
    component.onAddProduct();

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/products/create']);
  });

  it('should show delete modal when delete is requested', () => {
    // Arrange
    const product = { id: '1', name: 'Test Product' } as Product;

    // Act
    component.onDelete(product);

    // Assert
    expect(component.showDeleteModal).toBeTruthy();
    expect(component.productToDelete).toBe(product);
  });

  it('should cancel delete operation', () => {
    // Arrange
    component.showDeleteModal = true;
    component.productToDelete = { id: '1', name: 'Test Product' } as Product;

    // Act
    component.onCancelDelete();

    // Assert
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBeNull();
  });

  it('should get correct delete confirmation title', () => {
    // Arrange
    const product = { id: '1', name: 'Test Product' } as Product;
    component.productToDelete = product;

    // Act
    const title = component.getDeleteConfirmationTitle();

    // Assert
    expect(title).toBe('¿Estas seguro de eliminar el producto Test Product?');
  });

  it('should get empty delete confirmation title when no product is selected', () => {
    // Arrange
    component.productToDelete = null;

    // Act
    const title = component.getDeleteConfirmationTitle();

    // Assert
    expect(title).toBe('¿Estas seguro de eliminar el producto ?');
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