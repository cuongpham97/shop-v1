import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, iif, of } from 'rxjs';
import { CdnService, UtilsService } from '../../../services';
import { ProductsService } from '../products.service';

@Component({
  selector: 'product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal: ElementRef

  readonly MAX_IMAGES_PER_SKU = 5;

  productId;

  form;
  isFormReady = false;

  customerGroups;

  skuForm;

  constructor( 
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: ProductsService,
    private utils: UtilsService,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');

    forkJoin({
      groups: this.service.getAllCustomerGroups(),
      product: iif(() => this.productId, this.service.getProductById(this.productId), of(null))
    })
    .subscribe(({ product, groups }) => {
      this.customerGroups = groups;
      this._prepareProductForm(product);

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

  _prepareProductForm(data?) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.maxLength(1000)],
      categories: [[]],
      model: ['', Validators.max(200)],
      brand: ['', Validators.maxLength(200)],
      description: '',
      warranty: ['', Validators.maxLength(100)],
      order: 1,
      dateAvailable: '',
      active: true,

      attributes: this.fb.array([]),
      variants: this.fb.array([]),

      price: ['', Validators.min(0)],
      special: this.fb.array([]),
      discount: this.fb.array([]),

      skus: this.fb.array([])
    });

    if (data) {
      data.categories = data.categories.map(cat => cat._id);
      data.dateAvailable = moment.utc(data.dateAvailable).format('DD/MM/YYYY');

      this.form.patchValue(data);
      
      data.attributes.forEach(attr => {
        this.createAttribute(attr);
      });

      data.special.forEach(line => {
        this.createSpecial(line);
      });

      data.discount.forEach(line => {
        this.createDiscount(line);
      });

      data.variants.forEach(variant => {
        this.createVariant(variant);
      });

      data.skus.forEach(sku => {
        this.createSku(sku);
      });
    }

    this.form.get('variants').valueChanges.subscribe(() => {
      this.form.get('skus').clear();
    })

    this.isFormReady = true;
  }

  createAttribute(data?) {
    const newAttribute = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      value: ['', Validators.maxLength(200)]
    });

    if (data) {
      newAttribute.patchValue(data);
    }

    this.form.get('attributes').push(newAttribute);
  }

  createSpecial(data?) {
    const newSpecial = this.fb.group({
      customerGroup: null,
      priority: 0,
      salePrice: ['', Validators.compose([Validators.required, Validators.min(0)])],
      effectiveDate: '',
      expiryDate: ''
    });

    if (data) {
      data.effectiveDate = moment.utc(data.effectiveDate).format('DD/MM/YYYY');
      data.expiryDate = moment.utc(data.expiryDate).format('DD/MM/YYYY');
      
      newSpecial.patchValue(data);
    }

    this.form.get('special').push(newSpecial);
  }

  createDiscount(data?) {
    const newDiscount = this.fb.group({
      customerGroup: null,
      quantity: 1,
      priority: 0,
      value: ['', Validators.compose([Validators.required, Validators.min(0)])],
      effectiveDate: '',
      expiryDate: ''
    });

    if (data) {
      data.effectiveDate = moment.utc(data.effectiveDate).format('DD/MM/YYYY');
      data.expiryDate = moment.utc(data.expiryDate).format('DD/MM/YYYY');
      
      newDiscount.patchValue(data);
    }

    this.form.get('discount').push(newDiscount);
  }

  createVariant(data?) {
    const newVariant = this.fb.group({
      control: ['DROP_DOWN', Validators.required],
      name: ['', Validators.compose([Validators.required, Validators.maxLength(200)])]
    });

    if (data) {
      newVariant.patchValue(data);
    }

    this.form.get('variants').push(newVariant);
  }

  createSku(data?) {
    const newSku = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      images: this.fb.array(new Array(this.MAX_IMAGES_PER_SKU).fill('')),
      attributes: this.fb.array([]),
      quantity: [0, Validators.min(0)],
      additionPrice: this.fb.group({
        sign: '+',
        value: 0
      }),
      order:  0
    });

    this.form.get('variants').value.forEach(variant => {
      (newSku.get('attributes') as FormArray).push(this.fb.group({
        name: variant.name,
        value: ['', Validators.required]
      }));
    });

    if (data) {
      newSku.patchValue(data);
    }

    this.form.get('skus').push(newSku);
  }

  openModal(index?) {
    if (index === undefined) {
      this.createSku();
      index = this.form.get('skus').controls.length - 1;
    }

    this.skuForm = this.form.get('skus').controls[index];
    this.cdn.$(this.modal.nativeElement).modal('show');
  }

  onDoneBtnClick() {
    this.utils.markFormControlTouched(this.skuForm);

    if (this.skuForm.valid) {
      this.cdn.$(this.modal.nativeElement).modal('hide');
    }
  }

  createProduct() {
    this.cdn.swal({
      text: 'Creating!...',
      button: false
    });

    return this.service.createProduct(this.form.value)
      .subscribe(_category => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Product has been created',
          icon: 'success',
          buttons: {
            cancel: 'Close'
          }
        });

      }, _response => {
        this.cdn.swal({
          title: 'Error!',
          text: 'Something went wrong',
          icon: 'warning',
          buttons: {
            cancel: true
          }
        });
      });
  }

  updateProduct() {
    this.cdn.swal({
      text: 'Updating!...',
      button: false
    });

    return this.service.updateProduct(this.productId, this.form.value)
      .subscribe(_category => {
        this.cdn.swal({
          title: 'Success!',
          text: 'Product has been updated',
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

    if (this.productId) {
      this.updateProduct();

    } else {
      this.createProduct();
    }
  }

  reload() {
    return this.utils.reload();
  }
}
