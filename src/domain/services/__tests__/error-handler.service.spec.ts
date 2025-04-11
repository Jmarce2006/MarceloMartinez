import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from '../error-handler.service';
import { BackendError } from '../../errors/backend-error';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService]
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('should return BackendError as is when error is instance of BackendError', (done) => {
      const backendError = new BackendError('Test backend error');

      service.handleError(backendError).subscribe({
        error: (error) => {
          expect(error).toBe(backendError);
          expect(error.message).toBe('Test backend error');
          done();
        }
      });
    });

    it('should wrap non-BackendError in a new BackendError with generic message', (done) => {
      const error = new Error('Test error');

      service.handleError(error).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(BackendError);
          expect(error.message).toBe('Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.');
          done();
        }
      });
    });

    it('should handle error without message', (done) => {
      const error = new Error();

      service.handleError(error).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(BackendError);
          expect(error.message).toBe('Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.');
          done();
        }
      });
    });
  });
}); 