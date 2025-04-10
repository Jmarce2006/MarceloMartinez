import { Injectable } from '@angular/core';
import { Mapper } from '../../../../base/mapper';
import { Product } from '../../../../domain/models/product.model';
import { ProductEntity } from '../entities/product.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryMapper extends Mapper<ProductEntity, Product> {
  mapFrom(param: ProductEntity): Product {
    return {
      id: param.id,
      name: param.name,
      description: param.description,
      logo: param.logo,
      date_release: new Date(param.date_release),
      date_revision: new Date(param.date_revision)
    };
  }

  mapTo(param: Product): ProductEntity {
    return {
      id: param.id,
      name: param.name,
      description: param.description,
      logo: param.logo,
      date_release: param.date_release.toISOString(),
      date_revision: param.date_revision.toISOString()
    };
  }
} 