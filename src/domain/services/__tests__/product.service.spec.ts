import { TestBed } from '@angular/core/testing';
import { ProductService } from '../product.service';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from '../../models/product.model';
import { BackendError } from '../../errors/backend-error';
import { of, throwError } from 'rxjs';
import { InjectionToken } from '@angular/core';

const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('ProductRepository');

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: new Date('2023-01-01'),
    date_revision: new Date('2024-01-01')
  };

  const mockProducts: Product[] = [mockProduct];

  beforeEach(() => {
    const repositoryMock = {
      getProducts: jest.fn(),
      getProductById: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      verifyProductId: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: repositoryMock },
        { provide: 'ProductRepository', useValue: repositoryMock }
      ]
    });

    service = TestBed.inject(ProductService);
    repository = TestBed.inject(PRODUCT_REPOSITORY) as jest.Mocked<ProductRepository>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return products from repository', (done) => {
      repository.getProducts.mockReturnValue(of(mockProducts));

      service.getProducts().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          expect(repository.getProducts).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should propagate error from repository', (done) => {
      const error = new BackendError('Failed to fetch products');
      repository.getProducts.mockReturnValue(throwError(() => error));

      service.getProducts().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(repository.getProducts).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('getProductById', () => {
    it('should return product from repository', (done) => {
      repository.getProductById.mockReturnValue(of(mockProduct));

      service.getProductById('1').subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          expect(repository.getProductById).toHaveBeenCalledWith('1');
          done();
        }
      });
    });

    it('should propagate error from repository', (done) => {
      const error = new BackendError('Product not found');
      repository.getProductById.mockReturnValue(throwError(() => error));

      service.getProductById('1').subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(repository.getProductById).toHaveBeenCalledWith('1');
          done();
        }
      });
    });
  });

  describe('createProduct', () => {
    it('should create product through repository', (done) => {
      repository.createProduct.mockReturnValue(of(mockProduct));

      service.createProduct(mockProduct).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          expect(repository.createProduct).toHaveBeenCalledWith(mockProduct);
          done();
        }
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product through repository', (done) => {
      repository.updateProduct.mockReturnValue(of(mockProduct));

      service.updateProduct('1', mockProduct).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          expect(repository.updateProduct).toHaveBeenCalledWith('1', mockProduct);
          done();
        }
      });
    });

    it('should propagate error from repository', (done) => {
      const error = new BackendError('Failed to update product');
      repository.updateProduct.mockReturnValue(throwError(() => error));

      service.updateProduct('1', mockProduct).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(repository.updateProduct).toHaveBeenCalledWith('1', mockProduct);
          done();
        }
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product through repository', (done) => {
      repository.deleteProduct.mockReturnValue(of(undefined));

      service.deleteProduct('1').subscribe({
        next: () => {
          expect(repository.deleteProduct).toHaveBeenCalledWith('1');
          done();
        }
      });
    });
  });

  describe('verifyProductId', () => {
    it('should verify product id through repository', (done) => {
      repository.verifyProductId.mockReturnValue(of(true));

      service.verifyProductId('1').subscribe({
        next: (result) => {
          expect(result).toBe(true);
          expect(repository.verifyProductId).toHaveBeenCalledWith('1');
          done();
        }
      });
    });
  });
}); 