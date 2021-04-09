import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { iif, of } from 'rxjs';
import { CdnService, UtilsService } from '../../../services';
import { RolesService } from '../roles.service';
import { RolesValidators } from '../roles.validators';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit {
  roleId;

  form: FormGroup
  isFormReady = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: RolesService,
    private utils: UtilsService,
    private cdn: CdnService,
    private validator: RolesValidators
  ) { }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');

    iif(() => this.roleId, this.service.getRoleById(this.roleId), of(null)) 
      .subscribe(role => {
        this._prepareForm(role);

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

  _prepareForm(data?) {
    this.form = this.fb.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
        this.validator.checkNameTaken(data && data.name)
      ],
      level: [1, Validators.min(1)],
      active: '',
      permission: {}
    });

    if (data) {
      this.form.patchValue(data);
    }

    this.isFormReady = true;
  }

  createRole() {
    this.cdn.swal({
      text: 'Creating!...',
      button: false
    });

    return this.service.createRole(this.form.value)
      .subscribe(_role => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Role has been created',
          icon: 'success',
          buttons: {
            cancel: 'Close'
          }
        });

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

  updateRole() {
    this.cdn.swal({
      text: 'Updating!...',
      button: false
    });

    return this.service.updateRole(this.roleId, this.form.value)
      .subscribe(_role => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Role has been updated',
          icon: 'success',
          buttons: {
            cancel: 'Close'
          }
        });
      }, response => {
        const error = response.error;
        if (error.code === 'CANNOT_BE_CHANGED') {
          this.cdn.swal({
            title: 'Error!',
            text: 'Cannot update superadmin role',
            icon: 'warning',
            buttons: {
              cancel: true
            }
          });

        } else {
          this.cdn.swal({
            title: 'Error!',
            text: 'Something went wrong',
            icon: 'warning',
            buttons: {
              cancel: true
            }
          });
        }
      });
  }

  onSaveBtnClick() {
    this.utils.markFormControlTouched(this.form);
    if (this.form.invalid) {
      return;
    }

    console.log(this.form.value);
    if (this.roleId) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }
}
