import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
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

  add(product, sku, quantity) {
    if (quantity > 0) {
      const carted = this._items.getValue().find(line => {
        return (line.product == product && line.sku == sku);
      });

      if (carted) {
        quantity += carted.quantity;
      }

      return this.updateLine(product, sku, quantity);
    }
  }

  updateLine(product, sku, quantity) {
    const item = { product, sku, quantity };

    const carted = this._items.getValue().find(line => {
      return (line.product == item.product && line.sku == item.sku);
    });

    let total = this._items.getValue().reduce((a, c) => a + c.quantity, 0) + quantity;

    if (carted) {
      total -= carted.quantity;
    }

    if (total > this.CART_SIZE) {
      // TODO: alert giỏ hàng đầy
      alert('Giỏ hàng đầy');

      return;
    }

    return this.save(item);
  }

  removeLine(index) {
    const items = this._items.getValue();

    const item = {
      product: items[index].product,
      sku: items[index].sku,
      quantity: 0
    };

    return this.save(item);
  }

  save(item) {
    return this.http.post(`/carts/items`, item)
      .pipe(mergeMap(() => this.http.get('/carts')))
      .pipe(tap(cart => {
        this._items.next(cart['items']);

        return cart;
      }));
  }

  getItems() {
    return this._items.getValue();
  }

  checkout(items) {
    return this.http.post(`/checkouts`, { items: items }, {
      observe: 'response'
    });
  }

  ngOnDestroy() {
    this.alive.next();
    this.alive.complete();
  }
}
