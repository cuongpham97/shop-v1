import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CdnService } from '../../services';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('catProductsCarousel') set initCatProductsCarousel(el) {

    if (el) {
      this.cdn.$(el.nativeElement).owlCarousel({
        loop: false,
        dots: true,
        margin: 20,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left" aria-hidden="true"></i>',
          '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive:{
            0: {
                items: 2
            },
            768: {
                items: 3
            },
            1000: {
                items: 3
            }
        }
      });
    }
  }

  categories;
  
  constructor(
    private service: HomeService,
    private cdn: CdnService
  ) { }

  ngOnInit(): void {
    this.newArrivalPage.pipe(switchMap(page => this.service.getNewArrival(page)))
      .subscribe(dataset => {
        this.newArrival = this.newArrival.concat(dataset['data']);

        if (dataset['metadata']['isNext'] == true) {
          this.isLoadMaxNewArrival = true;
        }
      });

    try {
      this.categories = JSON.parse(localStorage.getItem('categories'));

      this.selectedCategory = this.categories[0];
      this.selectedSubCategory = null;

      this.getProductsOfCategory();

    } catch (e) {
      this.categories = [];
    }
  }
  
  // HOT NEW ARRIVALS
  newArrival = [];
  newArrivalPage = new BehaviorSubject(1);
  isLoadMaxNewArrival = false;

  loadMoreNewArrival() {
    this.newArrivalPage.next(this.newArrivalPage.getValue() + 1);
  }

  //CATEGORIES
  catProducts = [];
  selectedCategory;
  selectedSubCategory;

  getProductsOfCategory() {
    this.catProducts = [];
    const categoryName = (this.selectedSubCategory && this.selectedSubCategory.name) || (this.selectedCategory && this.selectedCategory.name);
    
    this.service.getProductsOfCategory(categoryName)
      .pipe(map(dataset => dataset['data']))
      .subscribe(products => this.catProducts = products);
  }

  getRatingStarsCount(rating) {
    return Array(Math.round(3)).fill('');
  }
}
