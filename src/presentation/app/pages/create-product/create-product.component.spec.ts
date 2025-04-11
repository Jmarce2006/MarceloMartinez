import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../../../../domain/services/product.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Product } from '../../../../domain/models/product.model';
import { ActivatedRouteSnapshot } from '@angular/router';

jest.mock('../../../../domain/services/product.service');

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let productService: jest.Mocked<ProductService>;
  let router: jest.Mocked<Router>;
  let route: ActivatedRoute;

  const mockProduct: Product = {
    id: 'trj-001',
    name: 'Tarjeta de Crédito',
    description: 'Tarjeta de consumo',
    logo: 'https://example.com/logo.png',
    date_release: new Date('2024-02-01'),
    date_revision: new Date('2025-02-01'),
  };

  beforeEach(async () => {
    const productServiceMock = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      getProductById: jest.fn(),
      deleteProduct: jest.fn(),
      verifyProductId: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    const paramMapMock = {
      get: (key: string) => (key === 'id' ? mockProduct.id : null),
      has: (key: string) => key === 'id',
      getAll: (key: string) => (key === 'id' ? [mockProduct.id] : []),
      keys: ['id'],
    } as ParamMap;

    const routeSnapshot = {
      paramMap: paramMapMock,
      url: [],
      params: {},
      queryParams: {},
      fragment: '',
      data: {},
      outlet: 'primary',
      component: undefined,
      routeConfig: null,
      root: {} as ActivatedRouteSnapshot,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      parameterMap: paramMapMock,
      queryParamMap: paramMapMock,
      title: null,
    } as unknown as ActivatedRouteSnapshot;

    route = {
      snapshot: routeSnapshot,
      params: of({}),  // Empty params by default
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateProductComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();

    productService = TestBed.inject(
      ProductService
    ) as jest.Mocked<ProductService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.ngOnInit();
    });

    it('should create new product successfully', fakeAsync(() => {
      // Set up create mode
      (route.snapshot!.paramMap as ParamMap).get = jest.fn().mockReturnValue(null);
      route.params = of({});
      component.ngOnInit();
      tick();

      // Mock service responses
      productService.verifyProductId.mockReturnValue(of(false));
      productService.createProduct.mockReturnValue(of(mockProduct));

      // Fill form with valid data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextYear = new Date(tomorrow);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      // Reset form before setting values
      component.productForm.reset();
      fixture.detectChanges();

      // Set form values
      component.productForm.patchValue({
        id: 'trj-001',
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: tomorrow.toISOString().split('T')[0],
        date_revision: nextYear.toISOString().split('T')[0],
      });
      fixture.detectChanges();
      tick();

      // Mark form as valid
      Object.keys(component.productForm.controls).forEach(key => {
        const control = component.productForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      fixture.detectChanges();
      tick(300); // Wait for async validation
      tick(); // Wait for async validation to complete

      // Verify form is valid before submitting
      expect(component.productForm.valid).toBe(true);
      expect(component.isFormValid()).toBe(true);

      // Submit form
      component.onSubmit();
      tick();

      // Verify service was called with correct data
      const expectedProduct = {
        id: 'trj-001',
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00.000Z'),
        date_revision: new Date(nextYear.toISOString().split('T')[0] + 'T00:00:00.000Z'),
      };

      expect(productService.createProduct).toHaveBeenCalledWith(expectedProduct);
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));
    
    it('should update existing product successfully', fakeAsync(() => {
      // Set up edit mode
      (route.snapshot!.paramMap as ParamMap).get = jest.fn().mockReturnValue(mockProduct.id);
      route.params = of({ id: mockProduct.id });
      productService.getProductById.mockReturnValue(of(mockProduct));
      component.ngOnInit();
      tick(); // Wait for ngOnInit to complete
    
      // Mock update response
      productService.updateProduct.mockReturnValue(of(mockProduct));
    
      // Update form values
      component.productForm.patchValue({
        name: 'Updated Name',
        description: 'Updated Description',
        logo: 'https://example.com/new-logo.png',
        date_release: '2024-02-01',
        date_revision: '2025-02-01',
      });
      tick(); // Wait for form value changes
    
      // Mark form as touched and dirty
      Object.keys(component.productForm.controls).forEach(key => {
        const control = component.productForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      fixture.detectChanges();
    
      // Verify form is valid
      expect(component.productForm.valid).toBe(true);
      expect(component.isFormValid()).toBe(true);
    
      // Submit form
      component.onSubmit();
      tick();
    
      // Verify service was called with correct data
      const expectedProduct = {
        id: mockProduct.id,
        name: 'Updated Name',
        description: 'Updated Description',
        logo: 'https://example.com/new-logo.png',
        date_release: new Date('2024-02-01'),
        date_revision: new Date('2025-02-01'),
      };
    
      expect(productService.updateProduct).toHaveBeenCalledWith(mockProduct.id, expectedProduct);
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));
    
    it('should handle submission error', fakeAsync(() => {
      // Set up create mode
      (route.snapshot!.paramMap as ParamMap).get = jest.fn().mockReturnValue(null);
      route.params = of({});
      component.ngOnInit();
      tick(); // Wait for ngOnInit to complete
    
      // Mock service responses
      productService.verifyProductId.mockReturnValue(of(false));
      const error = { message: 'Ocurrió un error al crear el producto.' };
      productService.createProduct.mockReturnValue(throwError(() => error));
    
      // Fill form with valid data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextYear = new Date(tomorrow);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      // Reset form before setting values
      component.productForm.reset();
      fixture.detectChanges();
    
      // Set form values
      component.productForm.patchValue({
        id: 'trj-001',
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: tomorrow.toISOString().split('T')[0],
        date_revision: nextYear.toISOString().split('T')[0],
      });
      fixture.detectChanges();
      tick();
    
      // Mark form as touched and dirty
      Object.keys(component.productForm.controls).forEach(key => {
        const control = component.productForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      fixture.detectChanges();
    
      // Wait for async validation
      tick(300); // Wait for debounceTime
      fixture.detectChanges();
      tick(); // Wait for async validation to complete
      fixture.detectChanges();
    
      // Verify form is valid
      expect(component.productForm.valid).toBe(true);
      expect(component.isFormValid()).toBe(true);
    
      // Submit form
      component.onSubmit();
      tick();
    
      // Verify error handling
      expect(component.errorMessage).toBe('Ocurrió un error al crear el producto.');
      expect(component.isLoading).toBe(false);
    }));
  });
});
