import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/models/product.model';
import { ProductEntity } from './entities/product.entity';
import { ProductRepositoryMapper } from './mappers/product-repository.mapper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductImplementationRepository implements ProductRepository {
  private readonly apiUrl = `${environment.apiUrl}/bp/products`;

  constructor(
    private _http: HttpClient,
    private _mapper: ProductRepositoryMapper
  ) {}

  getProducts(): Observable<Product[]> {
    return this._http.get<{data: ProductEntity[]}>(this.apiUrl).pipe(
      map(response => response.data.map(product => this._mapper.mapFrom(product)))
    );
  }
} 