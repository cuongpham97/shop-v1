import {
  Component,
  OnInit,
  Input,
  ContentChildren,
  QueryList,
  ContentChild,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  ElementRef
} from "@angular/core";
import * as _ from "lodash";
import { first } from "rxjs/operators";
import { ColumnComponent } from "./components/column.component";
import { FilterFormDirective } from "./directives/filter-form.directive";
import { FooterDirective } from "./directives/footer.directive";

@Component({
  selector: "datatable",
  templateUrl: "./datatable.component.html",
  styleUrls: ["./datatable.component.scss"]
})
export class DatatableComponent implements OnInit, AfterViewInit {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild("selectAllCheckbox") selectAllCheckbox: ElementRef;
  @ViewChild('filtersPanel') filtersPanel: ElementRef;

  @ContentChildren(ColumnComponent) columns: QueryList<ColumnComponent>;
  @ContentChild(FilterFormDirective) filterForm: FilterFormDirective;
  @ContentChild(FooterDirective) footer: FooterDirective;

  @Input("name") name;
  @Input("getData") getData: Function;
  @Input("checkbox") checkbox = true;
  @Input("filterable") filterable = false;
  @Input("selected") selected;

  data = [];

  filters = {};

  pagination = {
    page: 1,
    pageSize: 5,
    total: 0
  };

  orders = [];

  selectedCount = 0;
  selectedByIndex = {};

  constructor() {}

  ngOnInit() {
    this._getData();
  }

  _getData() {
    const query = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      orders: this.orders,
      filters: this.filters
    };

    return this.getData(query).pipe(first())
      .subscribe(dataset => {

        console.log(dataset.data);
        this.data = dataset.data;
        this.pagination.total = dataset.metadata.total;
      });
  }

  _refresh() {
    this._getData();
    this._resetSelection();
  }

  getCellValue(row, column) {
    return _.get(row, column.prop || column.name.toLowerCase());
  }

  onSelectEntries(event) {
    this.pagination.pageSize = +event.target.value;
    this._refresh();
  }

  onSortChange(value: { prop: string, type: string }) {
    this.orders = this.orders.filter(i => i !== value.prop && i !== `-${value.prop}`);

    switch (value.type) {
      case 'asc':
        this.orders.push(value.prop);
        break;
      
      case 'desc':
        this.orders.push('-' + value.prop);
        break;
    }

    this._refresh();
  }

  _onFilterChange(form) {
    this.filters = form.value;
    this._refresh();
  }

  onFilterChange = this._onFilterChange.bind(this);

  onPageChange(page) {
    this.pagination.page = page;
    this._refresh();
  }

  _resetSelection() {
    this.selectedCount = 0;
    this.selectedByIndex = {};

    this.selected.length = 0;

    this.selectAllCheckbox.nativeElement.checked = false;
    this.checkboxes.forEach(element => element.nativeElement.checked = false);
  }

  onSelect(index, row) {
    if (this.selectedByIndex[index]) {
      delete this.selectedByIndex[index];
      --this.selectedCount;

    } else {
      this.selectedByIndex[index] = row;
      ++this.selectedCount;
    }

    this.selected.length = 0
    this.selected.push(...Object.values(this.selectedByIndex));

    this.selectAllCheckbox.nativeElement.checked = !!this.selectedCount;
  }

  onSelectAll() {
    if (this.selectedCount) {
      this._resetSelection();

    } else {
      this.selected.length = 0;
      this.selectedByIndex = { ...this.data };
      this.selected.push(...Object.values(this.selectedByIndex));
      this.selectedCount = this.selected.length;

      this.checkboxes.forEach(element => element.nativeElement.checked = true);
    }
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
