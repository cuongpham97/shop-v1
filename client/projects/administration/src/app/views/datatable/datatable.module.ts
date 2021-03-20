import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxPaginationModule } from "ngx-pagination";
import { DatatableComponent } from "./datatable.component";
import { ColumnComponent } from "./directives/column.component";
import { HeaderDirective } from "./directives/header.directive";
import { CellDirective } from "./directives/cell.directive";
import { FooterDirective } from "./directives/footer.directive";

@NgModule({
  imports: [CommonModule, NgxPaginationModule],
  declarations: [
    DatatableComponent,
    ColumnComponent,
    HeaderDirective,
    CellDirective,
    FooterDirective
  ],
  exports: [
    DatatableComponent,
    ColumnComponent,
    HeaderDirective,
    CellDirective,
    FooterDirective
  ]
})
export class DatatableModule {}
