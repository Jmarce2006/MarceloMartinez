import { Injectable, Inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';
import { BackendError } from '../errors/backend-error';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    @Inject('ProductRepository') private _productRepository: ProductRepository
  ) {}

  getProducts(): Observable<Product[]> {
    return this._productRepository.getProducts().pipe(
      catchError((error: BackendError) => {
        return throwError(() => error);
      })
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this._productRepository.createProduct(product);
  }

  verifyProductId(id: string): Observable<boolean> {
    return this._productRepository.verifyProductId(id);
  }
} 