import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'zoomer',
  templateUrl: './image-zoomer.component.html',
  styleUrls: ['./image-zoomer.component.scss']
})
export class ImageZoomerComponent implements OnInit, AfterViewInit {

  @Input('src') src;

  @ViewChild('zoom') zoom;
  @ViewChild('image') image;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize();
  }
  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  resize() {
    this.renderer.setStyle(this.zoom.nativeElement, 'width', this.image.nativeElement.width + 'px');
    this.renderer.setStyle(this.zoom.nativeElement, 'height', this.image.nativeElement.height + 'px');
  }

  zoomImage(e) {
    let zoomer = e.currentTarget
    let offsetX, offsetY, x, y;

    e.offsetX 
      ? offsetX = e.offsetX 
      : offsetX = e.touches[0].pageX;

    e.offsetY 
      ? offsetY = e.offsetY 
      : offsetX = e.touches[0].pageX;

    x = (offsetX / zoomer.offsetWidth) * 100
    y = (offsetY / zoomer.offsetHeight) * 100
    zoomer.style.backgroundPosition = x + "% " + y + "%";
  }
}
