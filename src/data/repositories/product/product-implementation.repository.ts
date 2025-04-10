import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/models/product.model';
import { ProductEntity } from './entities/product.entity';
import { ProductRepositoryMapper } from './mappers/product-repository.mapper';
import { environment } from '../../../environments/environment';
import { BackendError } from '../../../domain/errors/backend-error';
import { ErrorHandlerService } from '../../../domain/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ProductImplementationRepository implements ProductRepository {
  private readonly apiUrl = `${environment.apiUrl}/bp/products`;

  constructor(
    private _http: HttpClient,
    private _mapper: ProductRepositoryMapper,
    private _errorHandler: ErrorHandlerService
  ) {}

  getProducts(): Observable<Product[]> {
    return this._http.get<{data: ProductEntity[]}>(this.apiUrl).pipe(
      map(response => response.data.map(product => this._mapper.mapFrom(product))),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          return this._errorHandler.handleError(
            new BackendError('No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.')
          );
        }
        return this._errorHandler.handleError(
          new BackendError('Ocurrió un error al obtener los productos.')
        );
      })
    );
  }
} 