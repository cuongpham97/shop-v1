import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, CdnService, UtilsService } from '../../services';
import { CategoriesService } from './categories.service';
import { StatusCodes } from 'http-status-codes';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  constructor(
    private service: CategoriesService,
    private auth: AuthService,
    private cdn: CdnService,
    private router: Router,
    private route: ActivatedRoute,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {}

  selected = [];

  getData(query): Observable<any> {
    return this.service.getManyCategories(query);
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
    if (this.checkPermission('category.update')) {
      this.router.navigate(['/categories/edit', id]);
    }
  }

  onAddBtnClick() {
    if (this.checkPermission('category.create')) {
      this.router.navigate(['/categories/new']);
    }
  }

  onDeleteBtnClick() {
    if (!this.checkPermission('category.delete')) {
      return;
    }

    if (!this.selected.length) {
      return this.cdn.swal({
        title: 'Error!',
        text: 'You must select at least one category to delete',
        icon: 'warning',
        button: {
          text: 'Accept',
          className: 'sweet-warning'
        }
      })
      .then(() =>this.reload());

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
    
        this.service.deleteCategories(ids).subscribe(
          response => {
            if (response.status === StatusCodes.OK) {
              const message = `${response.body['deletedCount']}\
                categories and subcategories has been deleted`;

              this.cdn.swal({
               title: 'Success',
                text: message,
                icon: 'success',
                buttons: { cancel: 'Close' }
              })
              .then(() => this.reload());

            } else {
              this.router.navigate(['/error']);
            }
          },
          response => {
            const error = response.error;
            if (error.code === 'RESOURCE_NOT_FOUND') {
              return this.cdn.swal({
                title: 'Warning!',
                text: 'Categories are missing',
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
