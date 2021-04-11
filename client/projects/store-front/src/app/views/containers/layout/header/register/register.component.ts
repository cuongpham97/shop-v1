import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { RegisterValidators } from './register.async-validators';
import { HeaderService } from '../header.service';
import { CdnService, UtilsService } from 'projects/store-front/src/app/services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form;

  constructor(
    private service: HeaderService,
    private registerValidators: RegisterValidators,
    private cdn: CdnService,
    private utils: UtilsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    this.form = this.fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{1,100}$/)
      ])],
      email: ['',
        Validators.pattern(/^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/),
        this.registerValidators.UniqueEmail()
      ],
      phone: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^\d{9,12}$/)
        ]),
        this.registerValidators.UniquePhone()
      ],
      gender: ['', Validators.required],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16)
      ])],
      accept: true
    });
  }

  prepaireCustomer(formValue) {
    return null;
  }

  register() {
    this.utils.markFormControlTouched(this.form);

    if (this.form.valid) {
      const customer = this.prepaireCustomer(this.form.value);

      this.service.registerNewCustomerAccount(customer)
        .subscribe(customer => {

          // TODO: alert register success;

          this.utils.reload();
        
        }, response => {
          // TODO: alert error;
        });
    }
  }
}
