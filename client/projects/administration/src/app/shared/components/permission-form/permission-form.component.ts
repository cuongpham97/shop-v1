import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { CdnService } from '../../../services';
import { PermissionFormService } from './permission-form.service';

@Component({
  selector: 'permission-form',
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PermissionFormComponent),
      multi: true,
    }
  ]
})
export class PermissionFormComponent implements OnInit, ControlValueAccessor, Validator {
  readonly keys = Object.keys;
  
  @Input('required') required;

  allPermission;

  form;
  value;
  isFormReady = false;

  constructor(
    private service: PermissionFormService,
    private fb: FormBuilder,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.service.getPermission()
      .subscribe(permission => {
        this.allPermission = permission;

        this._prepareForm();

      }, _response => {
        this.cdn.swal({
          title: 'Error!',
          text: 'Something went wrong',
          buttons: {
            cancel: true
          }
        });
      });
  }

  _prepareForm() {
    this.form = this.fb.group({});

    for (const [collection, action] of Object.entries(this.allPermission)) {
      this.form.addControl(collection, this.fb.group({}));
    
      for (const item of <any>action) {
        (this.form.get(collection) as FormGroup).addControl(item, new FormControl(false));
      }
    }

    if (this.value) {
      this.form.patchValue(this.value);
    }

    this.isFormReady = true;
  }

  _getValue() {
    const formValue = this.form.value;
    const result = {};

    for (const collection of Object.keys(formValue)) {
      result[collection] = [];

      for (const [action, value] of Object.entries(formValue[collection])) {
        if (value == true) {
          result[collection].push(action);
        }
      }
    }

    return result;
  }

  _setValue(value) {
    const formValue = {};

    for (const [collection, action] of Object.entries(value)) {
      formValue[collection] = [];

      for (const item of <any>action) {
        formValue[collection][item] = true;
      }
    }

    if (this.form) {
      this.form.patchValue(formValue);

    } else {
      this.value = formValue;
    }
  }

  onChange() {
    this.propagateChange(this._getValue());
  }

  public writeValue(value: any) {
    this._setValue(value);
  }

  public validate(_c: FormControl) {
    return (!this.required) ? null : {
      required: {
        valid: false
      },
    };
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public registerOnTouched() { }

  private propagateChange = (_: any) => { };
}
