import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { AuthService, CdnService, UtilsService } from '../../services';
import { ProductsService } from './products.service';
import { StatusCodes } from 'http-status-codes';
import { catchError, map, tap } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  constructor(
    private service: ProductsService,
    private auth: AuthService,
    private cdn: CdnService,
    private router: Router,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {}

  selected = [];
  products = [];

  _summarize(product) {
    const now = moment();

    const quantity = product.skus.reduce((curr, acc) => curr + acc.quantity, 0);
    const status = product.active && now.isAfter(product.dateAvailable)
      ? 'Enabled'
      : 'Disabled';
      
    return {
      _id: product._id,
      name: product.name,
      image: product.skus[0].images[0].url,
      price: product.skus[0].pricing.nomarlPrice,
      quantity: quantity,
      status: status,
      createdAt: product.createdAt
    };
  }

  getData(query): Observable<any> {
    return this.service.getManyProducts(query)
      .pipe(tap(dataset => this.products = dataset['data']))
      .pipe(map(dataset => {

        dataset['data'] = dataset['data'].map(product => this._summarize(product));
        return dataset;
      }))
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
    if (this.checkPermission('product.update')) {
      this.router.navigate(['/catalog/products/edit', id]);
    }
  }

  onAddBtnClick() {
    if (this.checkPermission('product.create')) {
      this.router.navigate(['/catalog/products/new']);
    }
  }

  onDeleteBtnClick() {
    if (!this.checkPermission('product.delete')) {
      return;
    }

    if (!this.selected.length) {
      return this.cdn.swal({
        title: 'Error!',
        text: 'You must select at least one product to delete',
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
    
        this.service.deleteProducts(ids).subscribe(
          response => {
            if (response.status === StatusCodes.OK) {
              const message = `${response.body['deletedCount']} products have been deleted`;

              this.cdn.swal({
               title: 'Success',
                text: message,
                icon: 'success',
                buttons: { cancel: 'Close' }
              })
              .then(() => this.reload());

            } else {
              this.cdn.swal.close();
              this.router.navigate(['/error-page']);
            }
          },
          response => {
            const error = response.error;
            if (error.code === 'RESOURCE_NOT_FOUND') {
              return this.cdn.swal({
                title: 'Warning!',
                text: 'Products are missing',
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
