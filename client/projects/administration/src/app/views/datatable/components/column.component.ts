import {
  Component,
  ContentChild,
  OnInit,
  Input,
  EventEmitter,
  Output
} from "@angular/core";
import { CellDirective } from "../directives/cell.directive";
import { HeaderDirective } from "../directives/header.directive";

@Component({
  selector: "column",
  template: "<ng-content></ng-content>"
})
export class ColumnComponent implements OnInit {
  @ContentChild(HeaderDirective) header: HeaderDirective;
  @ContentChild(CellDirective) cell: CellDirective;

  @Input("name") name;
  @Input("prop") prop;
  @Input("sortable") sortable = false;

  @Output("sortChange")
  sortChangeEvent = new EventEmitter<{ prop: string, type: string }>();

  order = "none";

  constructor() {}

  _nextOrderType() {
    const types = ['none', 'asc', 'desc'];
    
    const current = types.indexOf(this.order);
    return types[current + 1] || types[0];
  }

  onSortBtnClick() {
    this.order = this._nextOrderType();
    this.sortChangeEvent.emit({ prop: this.prop || this.name.toLowerCase(), type: this.order });
  }

  ngOnInit() {}
}
