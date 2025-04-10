import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../../domain/models/product.model';
import { ProductService } from '../../../../domain/services/product.service';
import {
  ProductPaginationService,
  PaginatedResult,
} from '../../../../domain/services/product-pagination.service';
import { finalize } from 'rxjs/operators';
import { BackendError } from '../../../../domain/errors/backend-error';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  searchTerm = '';
  paginatedData: PaginatedResult<Product> | null = null;
  errorMessage: string | null = null;
  activeMenuId: string | null = null;

  constructor(
    private _productService: ProductService,
    private _paginationService: ProductPaginationService,
    private _router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close menu when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container')) {
      this.activeMenuId = null;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this._productService
      .getProducts()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (products) => {
          this.allProducts = products;
          this.updatePaginatedData();
        },
        error: (error: BackendError) => {
          this.errorMessage = error.message;
          this.allProducts = [];
          this.updatePaginatedData();
        },
      });
  }

  updatePaginatedData(): void {
    this.paginatedData = this._paginationService.paginateAndFilter(
      this.allProducts,
      this.currentPage,
      this.pageSize,
      this.searchTerm
    );
    this.products = this.paginatedData.items;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= (this.paginatedData?.totalPages ?? 1)) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  toggleMenu(productId: string): void {
    this.activeMenuId = this.activeMenuId === productId ? null : productId;
  }

  onEdit(product: Product): void {
    this._router.navigate(['/products/edit', product.id]);
    this.activeMenuId = null;
  }

  onAddProduct(): void {
    this._router.navigate(['/products/create']);
  }
}
