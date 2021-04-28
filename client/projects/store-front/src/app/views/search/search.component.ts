import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  readonly viewMode = ["GRID_VIEW", "COLUMN_VIEW"];

  selectViewMode = "GRID_VIEW";

  filters;
  products;

  config = {
    itemsPerPage: 8,
    currentPage: 1,
    totalItems: 0
  }

  constructor(
    private activedRoute: ActivatedRoute, 
    private service: SearchService
  ) { }

  ngOnInit(): void {
    this.activedRoute.queryParams.subscribe(params => {
      this.filters = {
        text: '',
        category: '',
        name: '',
        brand: '',
        priceFrom: '',
        priceTo: '',
        orders: ''
      }

      params.text && (this.filters.text = params.text);
      params.category && (this.filters.category = params.category);

      this.findProduct();
    });
  }

  getRatingStarsCount(rating) {
    return Array(Math.round(3)).fill('');
  }

  setFilters(...arg) {
    arg.forEach(array => {
      this.filters[array[0]] = array[1];
    });

    this.findProduct();
  }

  clearAllFilters(){
    this.filters = {
      text: '',
      category: '',
      name: '',
      brand: '',
      priceFrom: '',
      priceTo: '',
      orders: ''
    }

    this.findProduct();
  }

  priceRangeSelect(from, to, form) {
    this.filters.priceFrom = from;
    this.filters.priceTo =  to;

    form.controls.priceFrom.setValue(from);
    form.controls.priceTo.setValue(to);

    this.findProduct();
  }

  findProduct(page: number = 1) {
    this.config.currentPage = page;

    this.service.findProduct(this.filters, page, 8)
      .pipe(tap(dataset => {
        this.config.currentPage = page;
        this.config.totalItems = dataset['metadata']['total'];
      }))
      .pipe(map(dataset => dataset['data']))
      .subscribe(products => this.products = products);
  }
}
