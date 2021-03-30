import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdnService, UtilsService } from '../../../services';
import { ProductsService } from '../products.service';

@Component({
  selector: 'product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  readonly MAX_IMAGES_PER_SKU = 5;

  productId;

  form;
  isFormReady = false;

  constructor( 
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: ProductsService,
    private utils: UtilsService,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    
    if (this.productId) {
      this.service.getProductById(this.productId)
        .subscribe(product => {
          this._prepareProductForm(product);
        
        }, response => {
          const error = response.error;
          if (error.code === 'RESOURCE_NOT_FOUND') {
            return this.cdn.swal({
              title: 'Error!',
              text: 'Product is missing',
              icon: 'warning',
              button: {
                text: 'Accept',
                className: 'sweet-warning'
              }
            });
          }  else {
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
      this._prepareProductForm(null);
    }
  }

  _prepareProductForm(data) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.maxLength(1000)],
      categories: [],
      model: ['', Validators.max(200)],
      brand: ['', Validators.maxLength(200)],
      description: ['', Validators.maxLength(4000)],
      warranty: ['', Validators.maxLength(100)],
      order: 1,
      dataAvailable: '',
      active: true,

      attributes: this.fb.array([]),
      variants: this.fb.array([]),
      
      pricingTemplate: ['PRODUCT', Validators.required],
      price: ['', Validators.min(0)],
      special: this.fb.array([]),
      discount: this.fb.array([]),

      skus: this.fb.array([])
    });

    if (data) {
      data.categories = ['605e0bcd50ddfd0015a3fc8d'] //data.categories.map(cat => cat._id);
      this.form.patchValue(data);
      
      data.attributes.forEach(attr => {
        this.createAttribute(attr);
      });

      data.variants.forEach(variant => {
        this.createVariant(variant);
      });
    }

    this.isFormReady = true;
  }

  createAttribute(data) {
    const newAttribute = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      value: ['', Validators.maxLength(200)]
    });

    if (data) {
      newAttribute.patchValue(data);
    }

    this.form.get('attributes').push(newAttribute);
  }

  removeAttribute(index) {
    this.form.get('attributes').removeAt(index);
  }

  createVariant(data) {
    const newVariant = this.fb.group({
      control: ['DROP_DOWN', Validators.required],
      name: ['', Validators.compose([Validators.required, Validators.maxLength(200)])]
    });

    if (data) {
      newVariant.patchValue(data);
    }

    this.form.get('variants').push(newVariant);
  }

  removeVariant(index) {
    this.form.get('variants').removeAt(index);
  }

  onSaveBtnClick() {
    console.log(this.form.value);
  }

  reload() {
    return this.utils.reload();
  }
}
