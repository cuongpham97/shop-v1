import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, CdnService, UtilsService } from '../../services';
import { CustomerGroupsService } from './customer-groups.service';
import { StatusCodes } from 'http-status-codes';

@Component({
  selector: 'customer-groups',
  templateUrl: './customer-groups.component.html',
  styleUrls: ['./customer-groups.component.scss']
})
export class CustomerGroupsComponent implements OnInit {
  constructor(
    private service: CustomerGroupsService,
    private auth: AuthService,
    private cdn: CdnService,
    private router: Router,
    private route: ActivatedRoute,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {}

  selected = [];

  getData(query): Observable<any> {
    return this.service.getManyGroups(query);
  }

  checkPermission(permission) {
    if (!this.auth.can(permission)) {
      this.cdn.swal({
        title: 'Error!',
        text: 'You don\'t have permission to access',
        icon: 'warning',
        button: {
          text: 'Accept',
          className: 'sweet-warning'
        }
      });
      return false;
    }
    return true;
  }

  onEditBtnClick(id) {
    if (this.checkPermission('customer-group.update')) {
      this.router.navigate(['/customers/customer-groups/edit', id]);
    }
  }

  onAddBtnClick() {
    if (this.checkPermission('customer-group.create')) {
      this.router.navigate(['/customers/customer-groups/new']);
    }
  }

  onDeleteBtnClick() {
    if (!this.checkPermission('customer-group.delete')) {
      return;
    }

    if (!this.selected.length) {
      return this.cdn.swal({
        title: 'Error!',
        text: 'You must select at least one group to delete',
        icon: 'warning',
        button: {
          text: 'Accept',
          className: 'sweet-warning'
        }
      });

    }

    this.cdn.swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover',
      icon: 'info',
      buttons: {
        cancel: true,
        accept: {
          text: 'Accept',
          value: true
        }
      }
    })
    .then(accept => {
      if (accept) {
        const ids = this.selected.map(row => row._id);

        this.cdn.swal({
          text: 'Deleting!...',
          button: false
        });
    
        this.service.deleteGroups(ids).subscribe(
          response => {
            if (response.status === StatusCodes.OK) {
              const message = `${response.body['deletedCount']} customer groups has been deleted`;

              this.cdn.swal({
               title: 'Success',
                text: message,
                icon: 'success',
                buttons: { cancel: 'Close' }
              })
              .then(() => this.reload());

            } else {
              this.router.navigate(['/error-page']);
              this.cdn.swal.close();
            }
          },
          response => {
            const error = response.error;
            if (error.code === 'RESOURCE_NOT_FOUND') {
              return this.cdn.swal({
                title: 'Warning!',
                text: 'Customer groups are missing',
                icon: 'warning',
                button: {
                  text: 'Accept',
                  className: 'sweet-warning'
                }
              })
              .then(() => this.reload());
            }
          }
        );
      }
    });
  }

  reload() {
    return this.utils.reload();
  }
}
