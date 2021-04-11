import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../header.service';

@Component({
  selector: 'category-menu',
  templateUrl: './category-menu.component.html',
  styleUrls: ['./category-menu.component.scss']
})
export class CategoryMenuComponent implements OnInit {

  categoryTree;

  constructor(
    private service: HeaderService
  ) { }

  ngOnInit(): void {
    this.service.getCategoriesTree()
      .subscribe(categoriesTree => {
        this.categoryTree = categoriesTree;

        localStorage.setItem('categories', JSON.stringify(this.categoryTree));
      });
  }

  ignoreEvent(event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
