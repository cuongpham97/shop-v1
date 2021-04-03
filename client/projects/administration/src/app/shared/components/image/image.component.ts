import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { CdnService } from '../../../services';
import { ImageService } from './image.service';

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
  @Input('name') name;
  @Input('description') description;
  @Input('width') width;
  @Input('height') height;

  src;
  controlWidth;
  controlHeight;

  isDone = true;
  croppingImage = null;
  cropper = null;
  originData = null;
  
  flipX = 1;
  flipY = 1;

  progress = 0;

  constructor(
    private service: ImageService,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.controlWidth = this.width < this.height ? 100 : 100 * (this.width / this.height); 
    this.controlHeight = this.width < this.height ? 100 : 100 * (this.width / this.height); 

    if (this.width > this.height) {
      this.controlHeight = 100;
      this.controlWidth = this.width / this.height * 100;
    
    } else {
      this.controlWidth = 100;
      this.controlHeight = this.height / this.width * 100;
    }

    this.cdn.$(this.modal.nativeElement).on('show.bs.modal', () => {
      this.progress = 0;
    });

    this.cdn.$(this.modal.nativeElement).on('hidden.bs.modal', () => {
      if (this.cropper) {
        this.cropper.destroy();
      }

      this.isDone = true;
      this.croppingImage = null;
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
      this.croppingImage = reader.result;

      this.cdn.$(this.modal.nativeElement).modal('show');
    }, false);

    reader.readAsDataURL(file);
  }

  _createCropArea() {
    if (this.cropper) {
      this.cropper.destroy();
    }

    const cropArea = this.cropArea.nativeElement;

    this.cropper = new this.cdn.Cropper(cropArea, {
      responsive: true,
      viewMode: 0,
      aspectRatio: this.width / this.height,
      minContainerWidth: 300,
      minContainerHeight: 300,

      movable: true
    });
  }

  onRemoveBtnClick() {
    this.src = '';

    this.propagateChange(null);
  }

  onEditBtnClick() {
    this.isDone = false; 
    this._createCropArea();
  }

  onUploadBtnClick() {
    return this.service.uploadImage({
      name: this.name,
      image: this.croppingImage,
      description: this.description
    })
    .subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        const percent = Math.round(100 * event.loaded / event.total);
        this.progress = percent - 1;
      
      } else if (event instanceof HttpResponse) {
        this.src = (event as any).body.url;
        this.progress = 100;

        this.propagateChange(event.body);
        this.cdn.$(this.modal.nativeElement).modal('hide');
      }
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

  // Action button

  crop() {
    this.croppingImage = this.cropper.getCroppedCanvas({
      width: this.width,
      height: this.height
    }).toDataURL('image/jpeg');
    
    this.cropper.destroy();
    this.isDone = true;
  }

  reset() {
    this.croppingImage = this.originData;
    this.cropper.replace(this.originData);
  }

  cancel() {
    this.cropper.destroy();
    this.isDone = true;
  }

  // Form control action
  public writeValue(imageObj: any) {
    if (imageObj) {
      this.src = imageObj.url;
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
