import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdnService, UtilsService } from '../../../services';
import { RolesService } from '../orders.service';
import { RolesValidators } from '../orders.validators';

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

    if (this.roleId) {
      this.service.getRoleById(this.roleId)
        .subscribe(role => {
          this._prepareForm(role);

        }, response => {
          const error = response.error;
          if (error.code === 'RESOURCE_NOT_FOUND') {
            return this.cdn.swal({
              title: 'Error!',
              text: 'Role is missing',
              icon: 'warning',
              button: {
                text: 'Accept',
                className: 'sweet-warning'
              }
            });

          } else {
            this.cdn.swal({
              title: 'Error!',
              text: 'Something went wrong',
              buttons: {
                cancel: true
              }
            });
          }
        });

    } else {
      this._prepareForm(null);
    }
  }

  _prepareForm(data) {
    this.form = this.fb.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
        this.validator.checkNameTaken(data && data.name)
      ],
      parent: null,
      order: [100, Validators.required],
      description: ['', Validators.maxLength(2000)]
    });

    if (data) {
      this.form.patchValue({
        name: data.name,
        parent: data.ancestors[data.ancestors.length - 1],
        order: data.order,
        description: data.description
      });
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

  onSaveBtnClick() {
    this.utils.markFormControlTouched(this.form);
    if (this.form.invalid) {
      return;
    }

    if (this.roleId) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }
}
