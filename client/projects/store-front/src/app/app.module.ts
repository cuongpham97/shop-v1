import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APIInterceptor } from './interceptors/api.interceptor';
import { JWTInterceptor } from './interceptors/jwt.interceptor';
import { AuthService, CartService, CdnService, UtilsService } from './services';
import { SharedModule } from './shared/shared.module';
import { LayoutComponent } from './views/containers/layout/layout.component';
import { HeaderComponent } from './views/containers/layout/header/header.component';
import { FooterComponent } from './views/containers/layout/footer/footer.component';
import { CategoryMenuComponent } from './views/containers/layout/header/category-menu/category-menu.component';
import { SigninComponent } from './views/containers/layout/header/signin/signin.component';
import { HeaderService } from './views/containers/layout/header/header.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './views/containers/layout/header/register/register.component';

const APP_COMPONENTS = [
  LayoutComponent,
  HeaderComponent,
  CategoryMenuComponent,
  RegisterComponent,
  SigninComponent,
  FooterComponent
];

const APP_SERVICES = [
  AuthService,
  CdnService,
  UtilsService,
  CartService,
  HeaderService
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
    FormsModule,
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
