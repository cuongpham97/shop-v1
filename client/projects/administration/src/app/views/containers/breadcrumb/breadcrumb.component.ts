import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MenuService } from '../../../services';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  alive: Subject<any> = new Subject();

  breadcrumbList: Array<any> = [];

  constructor(
    private router: Router,  
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this._traceRoutePath(this.router.url);

    this.router.events
      .pipe(takeUntil(this.alive))
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(router => this._traceRoutePath(router['urlAfterRedirects']));
  }

  _traceRoutePath(url) {
    if (!url && typeof url !== 'string') return;

    let menu = this.menuService.getMenu();
    if (!menu) return;

    this.breadcrumbList = [];
    let fragments = url.replace(/^\//, '').split('/');

    for (const [index, route] of fragments.entries()) {
      const match = menu.find(item => item.path.replace(/^\//, '') === route);
      if (!match) {
        return;

      } else {
        this.breadcrumbList.push({
          name: match.name,
          path: (index === 0) ? match.path : `${this.breadcrumbList[index - 1].path}/${match.path.slice(1)}`,
          link: match.link
        });

        if (index + 1 !== fragments.length) {
          menu = match.children;
        }
      }
    }
  }

  ngOnDestroy() {
    this.alive.next();
    this.alive.complete();
  }
}
