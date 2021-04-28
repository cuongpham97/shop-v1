import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { ImageZoomerComponent } from './image-zoomer/image-zoomer.component';
import { FormsModule } from '@angular/forms';
import { SanitizeHtmlPipe } from './detail.pipes';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DetailComponent,
    ImageZoomerComponent,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    DetailRoutingModule,
    SharedModule
  ]
})
export class DetailModule { }
