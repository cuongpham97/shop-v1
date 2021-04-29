import { Component, OnInit } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { Router } from '@angular/router';
import { CartService, AuthService, UtilsService } from '../../services';
import { forkJoin } from 'rxjs';
import { FormBuilder } from '@angular/forms';

enum action { VIEW, SELECT, CREATE_OR_EDIT };

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  readonly action = action;
  
  customer;
  checkout;
  provinces;
  districtsAndWards = [];
  wards = [];

  form;
  isFormReady = false;

  addressAction = action.VIEW;
  addressForm
  selectedAddress;

  constructor(
    private auth: AuthService,
    private cart: CartService,
    private service: CheckoutService,
    private fb: FormBuilder,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    if (!this.auth.getCurrentUser()) {
      return this.router.navigateByUrl('');
    }

    forkJoin({
      customer: this.service.getCustomer(),
      checkout: this.service.getCheckOut(),
      provinces: this.service.getProvinces()
    })
    .subscribe(({ customer, checkout, provinces }) => {
      this.customer = customer;
      this.checkout = checkout;
      this.provinces = provinces;

      this.selectedAddress = customer['addresses'][0] || null;
      this._prepareForm();

    }, _response => {
      // TODO: alert error;
      alert('An error has occured');
    });
  }

  _prepareForm() {
    this.form = this.fb.group({
      message: ''
    });

    this.isFormReady = true;
  }

  onChangeAddressBtnClick(event) {
    this.addressAction = action.SELECT;
    event.preventDefault();
  }

  onContinueBtnClick() {
    this.addressAction = action.VIEW;
  }

  onAddressRadioChecked(address) {
    this.selectedAddress = address;
  }

  onCreateAddressBtnClick() {
    this.addressAction = action.CREATE_OR_EDIT;
  }

  onEditAddressBtnClick(event, index) {
    this.addressAction = action.CREATE_OR_EDIT;
    event.preventDefault();
  }

  onSelectProvince(event) {
    this.service.getDistrictsAndWards(event.target.value)
      .subscribe(response => {
        this.districtsAndWards = <Array<any>>(response);
        this.wards = this.districtsAndWards[0].wards;
      });
  }

  onSelectDistrict(event) {
    const district = this.districtsAndWards.find(district => district.code === event.target.value);
    this.wards = district.wards;

    console.log(this.districtsAndWards, district, this.wards);
  }

  placeOrder() {
    this.utils.markFormControlTouched(this.form);

    if (this.form.valid) {
      this.service.createOrder(this.form.value).subscribe(_order => {
        this.cart.retrieve();
        this.router.navigateByUrl('/profile/orders');
    
      }, _response => {
        // TODO: Alert error
        alert('An error has occured')
      });
    }
  }
}
