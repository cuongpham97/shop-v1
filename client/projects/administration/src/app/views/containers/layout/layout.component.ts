import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services';

declare const $: any;

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  alive: Subject<any> = new Subject();
  user: any;

  constructor(public auth: AuthService) { 
    this.auth.currentUser$
      .pipe(takeUntil(this.alive))
      .subscribe(user => this.user = user);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
    if (event.target.innerWidth < 992) {
      $('#js-wrapper').removeClass("toggled");
    }
  }

  ngOnInit(): void {
    $("#js-sidebar-toggle").click(function (e) {
      e.preventDefault();
      $("#js-wrapper").toggleClass("toggled");
    });
  }

  ngOnDestroy(): void {
    this.alive.next();
    this.alive.complete();
  }
}

