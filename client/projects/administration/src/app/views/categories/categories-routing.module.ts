import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { CategoryFormComponent } from './category-form/category-form.component';

const routes: Routes = [
  { 
    path: "", children: [
      { path: '', component: CategoriesComponent },
      { path: 'new', component: CategoryFormComponent },
      { path: 'edit/:id', component: CategoryFormComponent }
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
