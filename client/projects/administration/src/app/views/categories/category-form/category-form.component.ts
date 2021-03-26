import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdnService, UtilsService } from '../../../services';
import { CategoriesService } from '../categories.service';
import { CategoriesValidators } from '../categories.validators';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  
  categoryId;

  form: FormGroup
  isFormReady = false;

  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: CategoriesService,
    private utils: UtilsService,
    private cdn: CdnService,
    private validator: CategoriesValidators
  ) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    
    if (this.categoryId) {
      this.service.getCategoryById(this.categoryId)
        .subscribe(category => {
          this._prepareForm(category);

        }, _error => {
          this.router.navigate(['/error']);
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
        this.validator.uniqueName(data && data.name)
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

  createCategory() {
    this.cdn.swal({
      text: 'Creating!...',
      button: false
    });

    return this.service.createCategory(this.form.value)
      .subscribe(_category => {
        this.cdn.swal({
          title: 'Success!',
           text: 'Category has been created',
           icon: 'success',
           buttons: {
             cancel: 'Close'
           }
         })
         .then(() => this.reload());

      }, _error => {
        this.router.navigate(['/error']);
      });
  }

  updateCategory() {
    this.cdn.swal({
      text: 'Updating!...',
      button: false
    });

    return this.service.updateCategories(this.categoryId, this.form.value)
      .subscribe(_category => {
        this.cdn.swal({
          title: 'Success!',
           text: 'Category has been updated',
           icon: 'success',
           buttons: {
             cancel: 'Close'
           }
         })
         .then(() => this.reload());

      }, _error => {
        this.router.navigate(['/error']);
      });
  }

  onSaveBtnClick() {
    this.utils.markFormControlTouched(this.form);
    if (this.form.invalid){
      return;
    }

    if (this.categoryId) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  reload() {
    return this.utils.reload();
  }
}
