import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APIInterceptor } from './interceptors/api.interceptor';
import { JWTInterceptor } from './interceptors/jwt.interceptor';
import { AuthService, MenuService, UtilsService, CdnService } from './services';
import { ReactiveFormsModule } from '@angular/forms';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { SharedModule } from './shared/shared.module';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './views/containers/layout/layout.component';
import { BreadcrumbComponent } from './views/containers/breadcrumb/breadcrumb.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

const APP_COMPONENTS = [
  SignInComponent,
  LayoutComponent,
  BreadcrumbComponent,
  NotFoundComponent
];

const APP_SERVICES = [
  AuthService,
  MenuService,
  UtilsService,
  CdnService
];

const APP_GUARDS = [
  AuthGuard
];

@NgModule({
  declarations: [
    AppComponent,
    ...APP_COMPONENTS
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    { provide: 'API_URL', useValue: 'http://api-shop.herokuapp.com'},
    { provide: HTTP_INTERCEPTORS, useClass: APIInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    ...APP_SERVICES,
    ...APP_GUARDS
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
