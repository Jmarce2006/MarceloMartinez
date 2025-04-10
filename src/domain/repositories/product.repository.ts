import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export abstract class ProductRepository {
  abstract getProducts(): Observable<Product[]>;
  abstract getProductById(id: string): Observable<Product>;
  abstract createProduct(product: Product): Observable<Product>;
  abstract updateProduct(id: string, product: Product): Observable<Product>;
  abstract verifyProductId(id: string): Observable<boolean>;
}
