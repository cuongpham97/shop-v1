import { Component, Input, forwardRef, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  NG_VALIDATORS, 
  FormControl, 
  Validator 
} from '@angular/forms';
import { CategoryPickerService } from './category-picker.service';

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
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  
  @Input() required;
  @Input('multiple') multiple = false;

  @Input('selected') 
  set _select(value) {
    if (value) {
      this.selectedIds = [].concat(value);
    }
  }

  @Input('ignore')
  set _ignore(value) {
    if (value) {
      this.ignore = [].concat(value);
    }
  }

  selectedIds: Array<any> = [];
  ignore: Array<any> = [];

  selected = [];
  selecting = [];

  categoriesTree;

  constructor(private service: CategoryPickerService) { }

  ngOnInit() {
    this.service.getCategoriesTree()
      .subscribe(response => {
        this.selecting = [...this.selectedIds];
        this.categoriesTree = response['categories'];
        
        this.getSelected();
      });
  }

  getSelected() {
    if (this.selectedIds.length) {
      this.service.getCategories(this.selectedIds)
        .subscribe(categories => this.selected = categories);
    } else {
      this.selected = [];
    }
  }

  onCheck(target, id) {
    if (target.checked) {
      if (!this.multiple) {
        this.checkboxes.forEach(e => e.nativeElement.checked = false);
        target.checked = true;
        this.selecting = [];
      }

      this.selecting.push(id);

    } else {
      this.selecting = this.selecting.filter(item => item != id);
    }
  }

  onAcceptBtnClick() {
    this.selectedIds = [...this.selecting];
    this.getSelected();

    if (this.multiple) {
      this.propagateChange(this.selectedIds); 
    } else {
      this.propagateChange(this.selectedIds[0]);
    }
  }

  onCloseBtnClick() {
    this.selecting = [...this.selectedIds];
  }

  // Form control action
  public writeValue(ids: any) {
    if (ids) {
      this.selectedIds = [].concat(ids);
    }
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public validate(_c: FormControl) {
    return (!this.required) ? null : {
      required: {
        valid: false
      },
    };
  }

  public registerOnTouched() { }

  private propagateChange = (_: any) => { };
}
