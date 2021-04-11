import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CdnService } from './cdn.service';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  alive: Subject<any> = new Subject();

  readonly CART_SIZE = 100;

  private _items: BehaviorSubject<any> = new BehaviorSubject([]);
  public items$: Observable<any> = this._items.asObservable();

  constructor(
    private http: HttpClient, 
    private cdn: CdnService,
    private auth: AuthService
  ) {
    this.auth.currentUser$
      .pipe(takeUntil(this.alive))
      .subscribe(user => user ? this.retrieve() : this._items.next([]));
  }

  retrieve() {
    this.http.get('/carts').subscribe(cart => this._items.next(cart['items']));
  }

  // add(product, sku, quantity) {
  //   if (quantity > 0) {
  //     let carted = this._items.getValue().find(line => {
  //       return (line.product == product && line.sku == sku);
  //     });
      
  //     if (carted) {
  //       quantity += carted.quantity;
  //     }

  //     return this.updateLine(product, sku, quantity);
  //   }
  // }

  // updateLine(product, sku, quantity) {
  //   const item = { product, sku, quantity };

  //   let carted = this._items.getValue().find(line => {
  //     return (line.product == item.product && line.sku == item.sku);
  //   });

  //   let total = this._items.getValue().reduce((a, c) => a + c.quantity, 0) + quantity;
    
  //   if (carted) {
  //     total -= carted.quantity;
  //   }

  //   if (total > this.CART_SIZE) {
  //     // TODO: alert giỏ hàng đầy

  //     return;
  //   }

  //   return this.save(item);
  // }

  // removeLine(index) {
  //   let items = this._items.getValue();

  //   const item = {
  //     product: items[index].product,
  //     sku: items[index].sku,
  //     quantity: 0
  //   };

  //   return this.save(item);
  // }

  // save(item) {
  //   return this.http.post(`/carts/items`, item, { observe: 'response' })
  //     .pipe(first())
  //     .pipe(mergeMap(res => {
        
  //       //retrieve cart
  //       return this.http.get('/carts')
  //         .pipe(first())
  //         .pipe(map((cart: any) => {

  //           this._items.next(cart.items);
  //           return res;
  //         }));

  //     }));
  // }

  // checkout(items) {
  //   return this.http.post(`/checkout`, { items: items }, {
  //     observe: 'response'
  //   });
  // }

  ngOnDestroy() {
    this.alive.next();
    this.alive.complete();
  }
}
