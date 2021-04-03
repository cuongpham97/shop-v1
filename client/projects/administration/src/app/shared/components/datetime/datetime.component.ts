import { Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import * as moment from 'moment';
import { CdnService } from '../../../services';

@Component({
  selector: 'datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatetimeComponent),
      multi: true,
    }
  ]
})
export class DatetimeComponent implements OnInit, ControlValueAccessor, Validator  {
  @ViewChild('input', { static: true }) input: ElementRef;
  
  @Input('ngClass') ngClass;

  @Input('value') value;
  @Input('format') format: string;
  @Input('placeholder') placeholder: string;
   
  constructor(private cdn: CdnService) { }

  ngOnInit(): void {
    this.cdn.$(this.input.nativeElement).datepicker({
      format: this.format,
      showOn: 'none'
    })
    .on('change', event => this.onChangeDate(event));
  }

  onChangeDate(event) {
    this.value = event.target.value;

    const isValid = moment(this.value, this.format, true).isValid();
    if (isValid) {
      this.propagateChange(this.value);
    
    } else {
      this.propagateChange(null);
    }
  }

  public writeValue(value: any) {
    if (value) {
      this.value = value;
    }
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public validate({ value }: FormControl) {
    const isValid = moment(value, this.format, true).isValid();

    return isValid ? null : {
      invalid: true
    };
  }

  public registerOnTouched() { }

  private propagateChange = (_: any) => { };
}
