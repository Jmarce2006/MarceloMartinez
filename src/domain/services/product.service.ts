import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    @Inject('ProductRepository') private _productRepository: ProductRepository
  ) {}

  getProducts(): Observable<Product[]> {
    return this._productRepository.getProducts();
  }
} 