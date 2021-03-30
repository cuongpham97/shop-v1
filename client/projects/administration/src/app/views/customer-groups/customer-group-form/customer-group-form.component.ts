import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdnService, UtilsService } from '../../../services';
import { CustomerGroupsService } from '../customer-groups.service';
import { CustomerGroupsValidators } from '../customer-groups.validators';

@Component({
  selector: 'customer-group-form',
  templateUrl: './customer-group-form.component.html',
  styleUrls: ['./customer-group-form.component.scss']
})
export class CustomerGroupFormComponent implements OnInit {
  
  groupId;

  form: FormGroup
  isFormReady = false;

  constructor( 
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: CustomerGroupsService,
    private utils: UtilsService,
    private cdn: CdnService,
    private validator: CustomerGroupsValidators
  ) { }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id');
    
    if (this.groupId) {
      this.service.getGroupById(this.groupId)
        .subscribe(group => {
          this._prepareForm(group);

        }, response => {
          const error = response.error;
          if (error.code === 'RESOURCE_NOT_FOUND') {
            return this.cdn.swal({
              title: 'Error!',
              text: 'Group is missing',
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
        Validators.compose([Validators.required, Validators.maxLength(200)]),
        this.validator.checkNameTaken(data && data.name)
      ],
      description: ['', Validators.maxLength(2000)]      
    });

    if (data) {
      this.form.patchValue({
        name: data.name,
        description: data.description
      });
    }

    this.isFormReady = true;
  }

  createGroup() {
    this.cdn.swal({
      text: 'Creating!...',
      button: false
    });

    return this.service.createGroup(this.form.value)
      .subscribe(_group => {
        this.cdn.swal({
          title: 'Success!',
           text: 'Customer group has been created',
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

  updateGroup() {
    this.cdn.swal({
      text: 'Updating!...',
      button: false
    });

    return this.service.updateGroup(this.groupId, this.form.value)
      .subscribe(_group => {
        this.cdn.swal({
          title: 'Success!',
           text: 'Customer group has been updated',
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
    if (this.form.invalid){
      return;
    }

    if (this.groupId) {
      this.updateGroup();
    } else {
      this.createGroup();
    }
  }
}
