import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'spiner',
  templateUrl: './spiner.component.html',
  styleUrls: ['./spiner.component.scss']
})
export class SpinerComponent implements OnInit {
  @Input('type') type: number = 1;
  
  constructor() { }

  ngOnInit(): void {
  }

}
