import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../domain/services/product.service';
import { BackendError } from '../../../../domain/errors/backend-error';
import {
  map,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CreateProductComponent implements OnInit {
  productForm: FormGroup = this._fb.group({
    id: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        asyncValidators: [this.idExistsValidator()],
      },
    ],
    name: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
    ],
    logo: ['', [Validators.required]],
    date_release: ['', [Validators.required, this.minDateValidator()]],
    date_revision: [{ value: '', disabled: true }],
  });
  isLoading = false;
  errorMessage: string | null = null;
  today = new Date().toISOString().split('T')[0];
  isEditMode = false;
  productId: string | null = null;

  constructor(
    private _fb: FormBuilder,
    private _productService: ProductService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.productForm.get('date_release')?.valueChanges.subscribe((date) => {
      if (date) {
        const revisionDate = this.calculateRevisionDate(date);
        this.productForm.patchValue(
          {
            date_revision: revisionDate,
          },
          { emitEvent: false }
        );
      }
    });
  }

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProduct(params['id']);
      }
    });
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this._productService.getProductById(id).subscribe({
      next: (product) => {
        // Reset form before setting new values
        this.productForm.reset();

        // First disable the ID field and clear its validators
        const idControl = this.productForm.get('id');
        if (idControl) {
          idControl.clearValidators();
          idControl.clearAsyncValidators();
          idControl.disable();
        }

        // Clear min date validator for date_release in edit mode
        const dateReleaseControl = this.productForm.get('date_release');
        if (dateReleaseControl) {
          dateReleaseControl.clearValidators();
          dateReleaseControl.setValidators([Validators.required]);
        }

        // Now set the values
        const releaseDate = new Date(product.date_release);
        const revisionDate = new Date(product.date_revision);

        this.productForm.patchValue({
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          date_release: releaseDate.toISOString().split('T')[0],
          date_revision: revisionDate.toISOString().split('T')[0],
        });

        // Update validity after setting values
        this.productForm.updateValueAndValidity();
        this.isLoading = false;
      },
      error: (error: BackendError) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  private idExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || this.isEditMode) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((id) =>
          this._productService.verifyProductId(id).pipe(
            map((exists) => (exists ? { idExists: true } : null)),
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
      if (!control.value || this.isEditMode) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();

      // Reset time parts to compare just the dates
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return inputDate >= today ? null : { minDate: true };
    };
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.isLoading = true;
      const formValue = this.productForm.getRawValue();
      const product = {
        ...formValue,
        date_release: new Date(formValue.date_release),
        date_revision: new Date(formValue.date_revision),
      };

      const request = this.isEditMode
        ? this._productService.updateProduct(this.productId!, product)
        : this._productService.createProduct(product);

      request.subscribe({
        next: () => {
          this._router.navigate(['/products']);
        },
        error: (error: BackendError) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
      });
    }
  }

  isFormValid(): boolean {
    if (this.isLoading || this.productForm.pending) {
      return false;
    }

    const requiredFields = ['name', 'description', 'logo', 'date_release'];
    if (!this.isEditMode) {
      requiredFields.push('id');
    }
    
    const allFieldsValid = requiredFields.every((fieldName) => {
      const control = this.productForm.get(fieldName);
      return control && control.valid;
    });

    return allFieldsValid;
  }

  onReset(): void {
    this.errorMessage = null;

    if (this.isEditMode) {
      // In edit mode, preserve the ID and reset other fields
      const currentId = this.productForm.get('id')?.value;
      this.productForm.reset();
      this.productForm.patchValue({
        id: currentId,
        date_revision: '',
      });

      // Keep ID field disabled
      const idControl = this.productForm.get('id');
      if (idControl) {
        idControl.disable();
      }
    } else {
      // In create mode, reset everything
      this.productForm.reset();
      this.productForm.patchValue({
        date_revision: '',
      });
    }
  }
}
