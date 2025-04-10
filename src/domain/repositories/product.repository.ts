import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export abstract class ProductRepository {
    abstract getProducts(): Observable<Product[]>;
} 