import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesService } from './categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  constructor(private service: CategoriesService) { }

  ngOnInit(): void {
  }

  selected = [];

  getData(query): Observable<any> {
    return this.service.getManyCategories(query);
  }
}
