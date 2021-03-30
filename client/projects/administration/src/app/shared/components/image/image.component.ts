import { Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { CdnService } from '../../../services';

@Component({
  selector: 'image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ImageComponent),
      multi: true,
    }
  ]
})
export class ImageComponent implements OnInit, ControlValueAccessor, Validator {
  @ViewChild('modal', { static: true }) modal: ElementRef<any>;
  @ViewChild('cropArea', { static: true }) cropArea: ElementRef<any>;

  @Input('required') required;
  url;

  cropper;
  originData;
  cropping;

  isDone = true;

  constructor(
    private cdn: CdnService
  ) { }

  ngOnInit(): void { 
    this.cdn.$(this.modal.nativeElement).on('hidden.bs.modal', () => {
      if (this.cropper) {
        this.cropper.destroy();
      }

      this.isDone = true;
      this.cropping = null;
      this.originData = null;
    });
  }

  onSelectImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    event.target.value = '';
    const reader = new FileReader;

    reader.addEventListener("load", () => {
      this.originData = reader.result;
      this.cropping = this.originData;

      this.cdn.$(this.modal.nativeElement).modal('show');
    }, false);

    reader.readAsDataURL(file);
  }

  _createCropArea() {
    if (this.cropper) {
      this.cropper.destroy();
    }

    const cropArea = this.cropArea.nativeElement;

    const cropper = new this.cdn.Cropper(cropArea, {
      responsive: true,
      viewMode: 0,
      aspectRatio: 2/3,
      minContainerWidth: 300,
      minContainerHeight: 300,

      movable: true
    });

    this.cropper = cropper;
  }

  onEditBtnClick() {
    this.isDone = false; 
    this._createCropArea();
  }


  // Action button
  flipX = 1;
  flipY = 1;

  crop() {
    this.cropping = this.cropper.getCroppedCanvas().toDataURL('image/jpeg');
    this.cropper.destroy();
    this.isDone = true;
  }

  reset() {
    this.cropping = this.originData;
    this.cropper.replace(this.originData);
  }

  cancel() {
    this.cropper.destroy();
    this.isDone = true;
  }

  // Form control action
  public writeValue(url: any) {
    if (url) {
      this.url = url;
    }
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public validate(_c: FormControl) {
    return (!this.required) ? null : {
      required: {
        valid: false,
      },
    };
  }

  public registerOnTouched() { }

  private propagateChange = (_: any) => { };
}
