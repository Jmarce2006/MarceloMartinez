import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from '../base/use-case';
import { Product } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class GetProductsUseCase
  implements UseCase<void, Observable<Product[]>>
{
  constructor(private _productRepository: ProductRepository) {}

  execute(): Observable<Product[]> {
    return this._productRepository.getProducts();
  }
}
