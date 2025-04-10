import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductRepository } from '../domain/repositories/product.repository';
import { ProductImplementationRepository } from './repositories/product/product-implementation.repository';
import { ProductService } from 'src/domain/services/product.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    ProductService,
    { provide: 'ProductRepository', useClass: ProductImplementationRepository },
  ],
})
export class DataModule {}
