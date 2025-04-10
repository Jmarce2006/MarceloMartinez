import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { BackendError } from '../errors/backend-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: Error): Observable<never> {
    if (error instanceof BackendError) {
      return throwError(() => error);
    }
    return throwError(() => new BackendError('Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.'));
  }
} 