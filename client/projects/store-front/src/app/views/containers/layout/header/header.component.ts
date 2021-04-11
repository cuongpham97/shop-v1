import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CartService, CdnService } from 'projects/store-front/src/app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('modal') modal;
  loginTab = true;

  customer;
  cartNumber = 0;

  constructor(
    private auth: AuthService,
    private cart: CartService,
    private router: Router,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.cdn.initHeader();

    this.auth.currentUser$.subscribe(customer => this.customer = customer);

    this.cart.items$.subscribe(items => this.cartNumber = items.reduce((a, c) => a + c.quantity, 0));
    
    this.auth.forceLogin$.subscribe(() => {
      this.loginTab = true;
      this.cdn.$(this.modal.nativeElement).modal('show');
    });
  }

  loginSuccess() {
    this.cdn.$(this.modal.nativeElement).modal('hide');
  }

  onLogoutButtonClick() {
    this.auth.logout();
  }

  search(form) {
    const text = form.value.text;
    if (text) {
      this.router.navigate(['search'], { queryParams: { text: text } });
    }
  }
}
