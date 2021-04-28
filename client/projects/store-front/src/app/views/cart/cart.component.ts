import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  alive: Subject<any> = new Subject();

  items;
  form;
  total;
  isSelectedProduct;

  constructor(
    private title: Title,
    public cart: CartService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.title.setTitle('Giỏ Hàng');

    this.cart.items$.pipe(takeUntil(this.alive))
      .subscribe(items => {
        this.items = items;

        this.form = this.fb.group({
          lines: this.fb.array([])
        });

      this.form.valueChanges
        .subscribe(value => {
          this.total = 0;
          this.isSelectedProduct = false;

            value.lines.forEach((checkbox, index) => {
              if (checkbox) {
                this.isSelectedProduct = true;
                this.total += this.items[index].pricing.price * this.items[index].quantity;
              }
            });
          });

        items.forEach(_item => {
          this.form.get('lines').push(this.fb.control(true));
        });
      });
  }
  
  removeCartAt(index) {
    // TODO: alert waiting...;

    this.cart.removeLine(index)
      .subscribe(_cart => {
        // TODO: alert success removed
        alert('success removed');

      }, _response => {
        // TODO: alert error;
      });
  }

  checkout() {
    let selectedItems = [];
    let cartItems = this.cart.getItems();

    this.form.value.lines.forEach((checkbox, index) => {
      if (checkbox) {
        selectedItems.push(cartItems[index]);
      }
    });
    
    selectedItems = selectedItems.map(item => {
      return {
        product: item.product,
        sku: item.sku,
        quantity: item.quantity
      }
    });

    this.cart.checkout(selectedItems)
      .subscribe(_checkout => {
        this.router.navigateByUrl('/checkout');
      
      }, _response => {
        // TODO: alert error occured
        alert('error occured');
      });
  }

  ngOnDestroy() {
    this.alive.next(null);
    this.alive.complete();
  }
}
