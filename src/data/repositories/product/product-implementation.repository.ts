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
  providedIn: 'root',
})
export class ProductImplementationRepository implements ProductRepository {
  private readonly apiUrl = `${environment.apiUrl}/bp/products`;

  constructor(
    private _http: HttpClient,
    private _mapper: ProductRepositoryMapper,
    private _errorHandler: ErrorHandlerService
  ) {}

  getProducts(): Observable<Product[]> {
    return this._http.get<{ data: ProductEntity[] }>(this.apiUrl).pipe(
      map((response) =>
        response.data.map((product) => this._mapper.mapFrom(product))
      ),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          return this._errorHandler.handleError(
            new BackendError(
              'No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.'
            )
          );
        }
        return this._errorHandler.handleError(
          new BackendError('Ocurrió un error al obtener los productos.')
        );
      })
    );
  }

  getProductById(id: string): Observable<Product> {
    return this._http.get<ProductEntity>(`${this.apiUrl}/${id}`).pipe(
      map((response) => this._mapper.mapFrom(response)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          return this._errorHandler.handleError(
            new BackendError(
              'No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.'
            )
          );
        }
        if (error.status === 404) {
          return this._errorHandler.handleError(
            new BackendError('El producto no fue encontrado.')
          );
        }
        return this._errorHandler.handleError(
          new BackendError('Ocurrió un error al obtener el producto.')
        );
      })
    );
  }

  createProduct(product: Product): Observable<Product> {
    const productEntity = this._mapper.mapTo(product);
    return this._http.post<ProductEntity>(this.apiUrl, productEntity).pipe(
      map((response) => this._mapper.mapFrom(response)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          return this._errorHandler.handleError(
            new BackendError(
              'No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.'
            )
          );
        }
        if (error.status === 400) {
          return this._errorHandler.handleError(
            new BackendError(
              error.error.message || 'Los datos del producto son inválidos.'
            )
          );
        }
        return this._errorHandler.handleError(
          new BackendError('Ocurrió un error al crear el producto.')
        );
      })
    );
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    const productEntity = this._mapper.mapTo(product);
    return this._http
      .put<ProductEntity>(`${this.apiUrl}/${id}`, productEntity)
      .pipe(
        map((response) => this._mapper.mapFrom(response)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0) {
            return this._errorHandler.handleError(
              new BackendError(
                'No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.'
              )
            );
          }
          if (error.status === 404) {
            return this._errorHandler.handleError(
              new BackendError('El producto no fue encontrado.')
            );
          }
          if (error.status === 400) {
            return this._errorHandler.handleError(
              new BackendError(
                error.error.message || 'Los datos del producto son inválidos.'
              )
            );
          }
          return this._errorHandler.handleError(
            new BackendError('Ocurrió un error al actualizar el producto.')
          );
        })
      );
  }

  verifyProductId(id: string): Observable<boolean> {
    return this._http.get<boolean>(`${this.apiUrl}/verification/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return this._errorHandler.handleError(
          new BackendError('Ocurrió un error al verificar el ID del producto.')
        );
      })
    );
  }
}
