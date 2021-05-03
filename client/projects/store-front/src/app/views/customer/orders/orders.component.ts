import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService, CdnService, UtilsService } from '../../../services';
import { OrdersService } from './orders.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders$: Observable<any>;

  selectedOrder;

  form;

  constructor(
    private router: Router,
    private service: OrdersService,
    private fb: FormBuilder,
    private utils: UtilsService,
    private cdn: CdnService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    if (!this.auth.getCurrentUser()) {
      this.router.navigateByUrl('');
    }

    this.form = this.fb.group({
      status: 'ALL',
      from: '',
      to: ''
    });

    this.orders$ = this.service.getOrders();
  }

  onFormChange() {
    console.log(this.form.value);
    // TODO: filter orders
  }

  showModal(orderId) {
    this.selectedOrder = orderId;
  }

  acceptCancelOrder(form) {
    this.utils.markFormControlTouched(form);

    if (form.valid) {
      this.service.cancelOrder(this.selectedOrder, form.value)
        .subscribe(_done => {
          // TODO: alert success
          alert('Đơn hàng đã hủy');

          this.cdn.$('#cancelOrderModal').modal('hide');
          this.orders$ = this.service.getOrders();
        
        }, _response => {
          // TODO: alert error
          alert('Error!');
        });
    }
  }
}
