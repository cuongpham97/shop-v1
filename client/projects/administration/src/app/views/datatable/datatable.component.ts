import {
  Component,
  OnInit,
  Input,
  ContentChildren,
  QueryList,
  ContentChild,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";

import { ColumnComponent } from "./directives/column.component";
import { FooterDirective } from "./directives/footer.directive";

@Component({
  selector: "datatable",
  templateUrl: "./datatable.component.html",
  styleUrls: ["./datatable.component.scss"]
})
export class DatatableComponent implements OnInit, AfterViewInit {
  @ViewChild('filtersPanel') filtersPanel;
  @ContentChildren(ColumnComponent) columns: QueryList<ColumnComponent>;
  @ContentChild(FooterDirective) footer: FooterDirective;

  @Input("data") data;
  @Input("checkbox") checkbox = true;

  @Output("sort")
  sortChangeEvent = new EventEmitter<any>();

  @Output("pageChange")
  pageChangeEvent = new EventEmitter<{ page: Number; pageSize: Number }>();

  pagination = {
    page: 1,
    pageSize: 5,
    total: 0
  };

  sorted = {};

  constructor() {}

  ngOnInit() {}

  onSortChange(value) {
    this.sorted[value.column] = value.status;
    this.sortChangeEvent.emit(this.sorted);
  }

  onPageChange(page) {
    this.pagination.page = page;
    this.pageChangeEvent.emit({ page, pageSize: this.pagination.pageSize });
  }

  onSelect(row) {
    alert(row.id)
  }

  onSelectAll() {
    alert('all')
  }

  ngAfterViewInit() {
    this.columns.forEach(col =>
      col.sortChangeEvent.subscribe(this.onSortChange.bind(this))
    );
  }

  filtersPanelToggle() {
    this.filtersPanel.nativeElement.classList.toggle('show');
  }
}
