import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdnService, UtilsService } from '../../../services';
import { AdminsService } from '../admins.service';
import { AdminsValidators } from '../admins.validators';

@Component({
  selector: 'app-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss']
})
export class AdminFormComponent implements OnInit {

  adminId;

  form: FormGroup
  isFormReady = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: AdminsService,
    private utils: UtilsService,
    private cdn: CdnService,
    private validator: AdminsValidators
  ) { }

  ngOnInit(): void {
    this.adminId = this.route.snapshot.paramMap.get('id');

    if (this.adminId) {
      this.service.getAdminById(this.adminId)
        .subscribe(admin => {
          this._prepareForm(admin);

        }, response => {
          const error = response.error;
          if (error.code === 'RESOURCE_NOT_FOUND') {
            return this.cdn.swal({
              title: 'Error!',
              text: 'Admin is missing',
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

  createAdmin() {
    this.cdn.swal({
      text: 'Creating!...',
      button: false
    });

    return this.service.createAdmin(this.form.value)
      .subscribe(_admin => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Admin has been created',
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

  updateAdmin() {
    this.cdn.swal({
      text: 'Updating!...',
      button: false
    });

    return this.service.updateAdmin(this.adminId, this.form.value)
      .subscribe(_admin => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Admin has been updated',
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

    if (this.adminId) {
      this.updateAdmin();
    } else {
      this.createAdmin();
    }
  }
}
