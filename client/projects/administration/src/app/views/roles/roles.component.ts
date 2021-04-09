import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { AuthService, CdnService, UtilsService } from '../../services';
import { RolesService } from './roles.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  constructor(
    private service: RolesService,
    private auth: AuthService,
    private cdn: CdnService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {}

  selected = [];

  getData(query): Observable<any> {
    return this.service.getManyRoles(query)
      .pipe(catchError(() => {
        this.cdn.swal({
          title: 'Error!',
          text: 'Something went wrong',
          buttons: {
            cancel: true
          }
        });

        return EMPTY;
      }));
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
    if (this.checkPermission('role.update')) {
      this.router.navigate(['/admins/roles/edit', id]);
    }
  }

  onAddBtnClick() {
    if (this.checkPermission('role.create')) {
      this.router.navigate(['/admins/roles/new']);
    }
  }

  onDeleteBtnClick() {
    if (!this.checkPermission('role.delete')) {
      return;
    }

    if (!this.selected.length) {
      return this.cdn.swal({
        title: 'Error!',
        text: 'You must select at least one role to delete',
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
    
        this.service.deleteRoles(ids).subscribe(
          response => {
            const message = `${response.body['deletedCount']}\
              roles have been deleted`;

            this.cdn.swal({
              title: 'Success',
              text: message,
              icon: 'success',
              buttons: { cancel: 'Close' }
            })
            .then(() => this.reload());
          },
          response => {
            const error = response.error;
            if (error.code === 'RESOURCE_NOT_FOUND') {
              return this.cdn.swal({
                title: 'Warning!',
                text: 'Roles are missing',
                icon: 'warning',
                button: {
                  text: 'Accept',
                  className: 'sweet-warning'
                }
              })
              .then(() => this.reload());

            } else {
              this.cdn.swal({
                title: 'Error!',
                text: 'Something went wrong',
                buttons: {
                  cancel: true
                }
              });
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
