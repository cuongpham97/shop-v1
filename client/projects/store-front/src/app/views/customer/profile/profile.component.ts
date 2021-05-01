import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { UtilsService } from '../../../services';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  form: FormGroup;
  isFormReady = false;

  customer;

  constructor(
    private fb: FormBuilder,
    private utils: UtilsService,
    private service: ProfileService
  ) { }

  ngOnInit(): void {
    this.service.getCurrentCustomer()
      .subscribe(customer => {
        this.customer = customer;

        this._prepareForm(customer);
      });
  }

  _prepareForm(customer) {
    this.form = this.fb.group({
      displayName: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      birthday: '',
      gender: 'Nam',
      email: '',
      phone: ['', Validators.pattern('\\d{8,12}')]
    });

    this.form.patchValue({
      displayName: customer.displayName,
      birthday: moment.utc(customer.birthday).format('DD/MM/YYYY'),
      gender: customer.gender,
      email: customer.email,
      phone: customer.phone
    });

    this.isFormReady = true;
  }

  onSaveBtnClick() {
    this.utils.markFormControlTouched(this.form);

    if (this.form.valid) {
      this.service.updateCustomer(this.form.value)
        .subscribe(customer => {
          this.customer = customer;

          console.log(this.customer);
        }, _response => {
          // TODO: alert error;
          alert('An error has occurred');
        })
    }
  }
}
