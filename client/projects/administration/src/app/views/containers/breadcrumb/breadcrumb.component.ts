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

  constructor(private _router: Router, private menu: MenuService) { }

  ngOnInit(): void {
    this.listenRouting();
  }

  listenRouting() {
    let routerUrl: string, routerList: Array<any>, target: any;

    this._router.events
      .pipe(takeUntil(this.alive))
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((router: any) => {
        routerUrl = router.urlAfterRedirects;

        if (routerUrl && typeof routerUrl === 'string') {

          target = this.menu.getMenu();
          this.breadcrumbList.length = 0;

          routerList = routerUrl.slice(1).split('/');

          routerList.forEach((router, index) => {
            if (!target.length) return;
            
            target = target.find(menuItem => menuItem.path.slice(1) === router);

            this.breadcrumbList.push({
              name: target.name,
              path: (index === 0) ? target.path : `${this.breadcrumbList[index-1].path}/${target.path.slice(1)}`
            });

            if (index + 1 !== routerList.length) {
              target = target.children;
            }
          });
        }
      });
  }

  ngOnDestroy() {
    this.alive.next();
    this.alive.complete();
  }
}
