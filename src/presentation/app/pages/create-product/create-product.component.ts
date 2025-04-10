import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../domain/services/product.service';
import { BackendError } from '../../../../domain/errors/backend-error';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateProductComponent {
  productForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private _fb: FormBuilder,
    private _productService: ProductService,
    private _router: Router
  ) {
    this.productForm = this._fb.group({
      id: ['', 
        {
          validators: [
            Validators.required, 
            Validators.minLength(3), 
            Validators.maxLength(10)
          ],
          asyncValidators: [this.idExistsValidator()]
        }
      ],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required, this.minDateValidator()]],
      date_revision: [{ value: '', disabled: true }]
    });

    // Update date_revision automatically when date_release changes
    this.productForm.get('date_release')?.valueChanges.subscribe(date => {
      if (date) {
        const revisionDate = this.calculateRevisionDate(date);
        this.productForm.patchValue({
          date_revision: revisionDate
        }, { emitEvent: false });
      }
    });
  }

  private idExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(id => 
          this._productService.verifyProductId(id).pipe(
            map(exists => exists ? { idExists: true } : null),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  private calculateRevisionDate(releaseDate: string): string {
    const date = new Date(releaseDate);
    const revisionDate = new Date(date.getTime());
    revisionDate.setDate(date.getDate());
    revisionDate.setMonth(date.getMonth());
    revisionDate.setFullYear(date.getFullYear() + 1);
    return revisionDate.toISOString().split('T')[0];
  }

  private minDateValidator() {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return inputDate >= today ? null : { minDate: true };
    };
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formValue = this.productForm.getRawValue();
      const product = {
        ...formValue,
        date_release: new Date(formValue.date_release),
        date_revision: new Date(formValue.date_revision)
      };

      this._productService.createProduct(product)
        .subscribe({
          next: () => {
            this._router.navigate(['/products']);
          },
          error: (error: BackendError) => {
            this.errorMessage = error.message;
            this.isLoading = false;
          }
        });
    }
  }

  onReset(): void {
    this.productForm.reset();
    this.errorMessage = null;
  }
} 