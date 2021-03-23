import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { DatatableComponent } from "./datatable.component";
import { ColumnComponent } from "./components/column.component";
import { HeaderDirective } from "./directives/header.directive";
import { CellDirective } from "./directives/cell.directive";
import { FooterDirective } from "./directives/footer.directive";
import { FilterFormDirective } from "./directives/filter-form.directive";

@NgModule({
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  declarations: [
    DatatableComponent,
    ColumnComponent,
    HeaderDirective,
    CellDirective,
    FooterDirective,
    FilterFormDirective
  ],
  exports: [
    DatatableComponent,
    ColumnComponent,
    HeaderDirective,
    CellDirective,
    FooterDirective,
    FilterFormDirective
  ]
})
export class DatatableModule {}
