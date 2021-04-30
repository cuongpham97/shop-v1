import { Component, OnInit } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { Router } from '@angular/router';
import { CartService, AuthService, UtilsService } from '../../services';
import { forkJoin } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';

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
  selectedAddress;
  addressForm;
  isAddressFormReady = false;
  editingAddressIndex = -1;

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
    this.editingAddressIndex = -1;

    this._prepareAddressForm();
  }

  _prepareAddressForm(data?) {
    this.addressForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      phone: ['', Validators.compose([Validators.required, Validators.pattern('\\d{9,12}')])],
      address: this.fb.group({
        street: ['', Validators.maxLength(200)],
        province: ['', Validators.required],
        district: ['', Validators.required],
        ward: ['', Validators.required]
      })
    });

    if (data) {
      this.addressForm.patchValue(data);
    }

    this.addressForm.get('address').get('province').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(provinceCode => this.service.getDistrictsAndWards(provinceCode))
      )
      .subscribe(response => {
        this.districtsAndWards = <Array<any>>(response);
        this.wards = this.districtsAndWards[0].wards;

        this.addressForm.patchValue({ 
          address: { 
            district: this.districtsAndWards[0].code, 
            ward: this.wards[0].code 
          } 
        });
      });

    this.addressForm.get('address').get('district').valueChanges
      .pipe(debounceTime(300))
      .subscribe(districtCode => {
        const district = this.districtsAndWards.find(district => district.code === districtCode);
        this.wards = district.wards;

        this.addressForm.patchValue({ 
          address: { 
            ward: this.wards[0].code 
          } 
        });
      });

    this.isAddressFormReady = true;
  }

  onEditAddressBtnClick(event, index) {
    this.addressAction = action.CREATE_OR_EDIT;
    this.editingAddressIndex = index;

    const data = this.customer.addresses[index];

    this.service.getDistrictsAndWards(data.address.province.code)
      .subscribe(response => {
        this.districtsAndWards = <Array<any>>(response);
        this.wards = this.districtsAndWards.find(district => district.code === data.address.district.code).wards;
      });

    this._prepareAddressForm({
      name: data.name,
      phone: data.phone,
      address: {
        street: data.address.street,
        province: data.address.province.code,
        district: data.address.district.code,
        ward: data.address.ward.code
      }
    });

    event.preventDefault();
  }

  onDeleteAddressBtnClick(event, index) {
    const selectedAddressIndex = this.customer.addresses.findIndex(address => address === this.selectedAddress);

    this.service.deleteAddress(this.customer.addresses, index)
      .subscribe(addresses => {
        this.customer['addresses'] = addresses;

        this.selectedAddress = index < selectedAddressIndex 
          ? addresses[selectedAddressIndex - 1]
          : addresses[selectedAddressIndex];

        this.addressAction = action.SELECT;
      });

    event.preventDefault();
  }

  onCancelBtnClick() {
    this.addressAction = action.SELECT;
  }

  onSaveBtnClick() {
    this.utils.markFormControlTouched(this.addressForm);
    if (this.addressForm.invalid) return;

    this.service.createOrEditAddress(this.customer.addresses, this.editingAddressIndex, this.addressForm.value)
      .subscribe(addresses => {
        this.customer['addresses'] = addresses;

        this.selectedAddress = this.editingAddressIndex == -1 
          ? addresses[addresses.length - 1]
          : addresses[this.editingAddressIndex];
  
        this.addressAction = action.SELECT;
      });
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
