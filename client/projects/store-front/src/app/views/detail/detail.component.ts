import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { switchMap, first, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { CartService } from '../../services/cart.service';
import { DetailService } from './detail.service';
import { AuthService, CdnService } from '../../services';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(
    private title: Title,
    private service: DetailService,
    private cart: CartService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cdn: CdnService
  ) { }

  Object = Object;

  arrayStar = Array(5);

  id: string;
  category;
  product;
  skus: Array<any>;

  selectedOption = {};
  fullOptions = {};
  activeOptions = {};

  selectedSku;
  quantity: number;

  ngOnInit() {
    this.title.setTitle('Chi tiết sản phẩm');

    this.route.paramMap.pipe(
      switchMap(params => {
        this.id = params.get('id');
        return this.service.getProduct(this.id);
      })
    ).subscribe(product => {
      this.product = product;
      this.skus = product['skus'];

      this.product['variants'].forEach(variant => {
        this.fullOptions[variant.name] = this.getOptionList(variant.name, this.skus);
      });

      this.activeOptions = Object.assign({}, this.fullOptions);
      this.selectedSku = this.skus[0];
      this.quantity = this.selectedSku.quantity ? 1 : 0;

    }, _response => {
      this.cdn.swal({
        title: 'Error!',
        text: 'Có lỗi xảy ra',
        icon: 'warning',
        buttons: {
          cancel: true
        }
      });
    });
  }

  getAvailableOptions(condition: { name: string, value: string } = null) {
    if (!condition) {
      return this.skus;
    }

    return this.skus.filter(
      sku => sku.attributes.some(
        attr => Object.keys(condition).every(key => attr[key] == condition[key])
      )
    );
  }

  getOptionList(optionName, variants: Array<any>): Array<string> {
    let list = variants.map(
      variant => variant.attributes.filter(attr => attr.name == optionName)[0].value
    );

    return _.uniq(list);
  }

  selectSku() {
    let attrs = Object.keys(this.selectedOption).map(key => ({
      name: key,
      value: this.selectedOption[key]
    }));

    return this.skus.find(
      sku => attrs.every(attr => _.some(sku.attributes, attr))
    );
  }

  select(optionName, value) {
    this.selectedOption[optionName] = value;
    let list = this.getAvailableOptions({ name: optionName, value: value });

    Object.keys(this.fullOptions).forEach(key => {
      if (key != optionName) {
        this.activeOptions[key] = this.getOptionList(key, list);
      }
    });
  }

  deselect(optionName) {
    if (Object.keys(this.selectedOption).indexOf(optionName) == -1) {
      return;
    }

    delete this.selectedOption[optionName];
    let list = this.getAvailableOptions(null);

    Object.keys(this.fullOptions).forEach(key => {
      if (key != optionName) {
        this.activeOptions[key] = this.getOptionList(key, list);
      }
    });
  }

  onSelectedOption(event, controlType, name, value?) {
    if (controlType == 'MULTIPLE_CHOICE') {

      this.cdn.$(event.target).parent().children().removeClass('active');

      if (this.selectedOption[name] != value) {
        this.select(name, value);
        this.cdn.$(event.target).addClass('active');
      } else {
        this.deselect(name);
      }
    }

    if (controlType == 'DROP_DOWN') {
      value = event.target.value;
      if (!value) return;

      if (this.selectedOption[name] != value) {
        this.select(name, value);
      } else {
        this.deselect(name);
      }
    }

    if (Object.keys(this.fullOptions).length == Object.keys(this.selectedOption).length) {
      this.selectedSku = this.selectSku();
      this.quantity = this.selectedSku.quantity ? 1 : 0;
    }
  }

  onQuantityChange() {
    if (this.quantity < 0) {
      this.quantity = 0;
    }

    if (this.quantity > 100) {
      this.quantity = 100;
    }

    if (this.quantity > this.selectedSku.quantity) {
      this.quantity = this.selectedSku.quantity;
    }
  }

  //custom view
  getRatingStarsCount(rating) {
    return Array(Math.round(3)).fill('');
  }

  addToCart() {
    if (!this.auth.getCurrentUser()) {
      this.auth.forceLogin();
      return;
    }

    if (!(Object.keys(this.product.variants).length == Object.keys(this.selectedOption).length)) {
      this.cdn.swal({
        title: 'Error!',
        text: 'Hãy chọn một loại',
        icon: 'warning',
        buttons: {
          cancel: true
        }
      });
      return;
    }

    if (this.quantity > 0 && this.quantity <= this.selectedSku.quantity) {

      this.cdn.swal({
        text: 'Đang chờ',
        buttons: {
          cancel: 'Đóng'
        }
      });

      const observer = this.cart.add(this.product._id, this.selectedSku._id, this.quantity);
      if (observer) {
        observer.subscribe(cart => {
          // TODO: alert add to cart success;
          alert('add to cart success');

          this.selectedSku.quantity -= this.quantity;
          this.zone.run(() => this.selectedSku = Object.assign({}, this.selectedSku));
          return;

        }, response => {
          // TODO: switch - case error;
          alert(response.message);
        });
      }
    }
  }

  //review
  // review$: Observable<any>;

  // config = {
  //   itemsPerPage: 5,
  //   currentPage: 1,
  //   totalItems: 0
  // }

  // getReviewPage(page: number) {
  //   this.config.currentPage = page;
  //   return this.review$ = this.service.getReviews(this.id, page - 1, 10)
  //     .pipe(tap(response => {
  //       this.config.currentPage = page;
  //       this.config.totalItems = response.count;
  //     }));
  // }
}
