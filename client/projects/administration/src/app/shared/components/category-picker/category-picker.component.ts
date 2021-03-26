import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  NG_VALIDATORS, 
  FormControl, 
  Validator 
} from '@angular/forms';
import { CategoryPickerService } from './category-picker.service';
import { CdnService } from '../../../services';

@Component({
  selector: 'category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoryPickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CategoryPickerComponent),
      multi: true,
    }
  ]
})
export class CategoryPickerComponent implements OnInit, ControlValueAccessor, Validator {
  @Input('ignore') ignoreId;
  @Input() required;
  @Input('selected') selectedId;

  categoriesTree;
  selected = null;
  loading = false;

  constructor(
    private service: CategoryPickerService,
    private cdn: CdnService
  ) { }

  ngOnInit() {
    this.service.getCategoriesTree()
      .subscribe(response => {
        this.categoriesTree = response['categories'];

        if (this.selectedId) {
          this.loading = true;

          this.service.getCategoryById(this.selectedId)
             .subscribe(category => {
               this.selected = category;
               this.loading = false;
             });
        }
      }, _error => {
        this.selectedId = null;
        this.selected = null;
      });
  }

  onCheck(event, item) {
    if (event.target.checked) {
      this.loading = true;

      this.service.getCategoryById(item._id)
        .subscribe(category => {
          this.selected = category;
          this.loading = false;
        }, error => {
          this.loading = false;
          this.selected = null;
        });
      
      this.propagateChange(item._id);

      this.cdn.$('#category input').prop('checked', false);
      event.target.checked = true;
    } else {

      this.selected = null;
      this.propagateChange(null);
    }
  }

  //form control action
  public writeValue(id: any) {
    if (id) {
      this.selectedId = id;
    }
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public validate(c: FormControl) {
    return (!this.required) ? null : {
      required: {
        valid: false,
      },
    };
  }

  public registerOnTouched() { }

  private propagateChange = (_: any) => { };
}
