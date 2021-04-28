import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  findProduct(filters, page = 0, pageSize = 20) {

    let url = `/collections?page=${page}&pageSize=${pageSize}`;

    if (filters.text) {
      url += `&search=${filters.text.replace('=', '')}`;
    }

    const str = [];

    if (filters.category) {
      str.push(`categories.path=${filters.category.replace('=', '')}`);
    }

    if (filters.name) {
      str.push(`name=${filters.name}`);
    }

    if (filters.brand) {
      str.push(`brand=${filters.brand}`);
    }

    if (str.length) {
      url += `&regexes=${str.join(',')}`;
    }

    if (filters.priceFrom) {
      url += `&priceFrom=${filters.priceFrom}`;
    }
     
    if (filters.priceTo) {
      url += `&priceTo=${filters.priceTo}`;
    }

    if (filters.orders) {
      url += `&orders=${filters.orders}`;
    }

    console.log(url);

    return this.http.get(url);
  }
}
