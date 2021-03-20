import {
  Component,
  ContentChild,
  OnInit,
  Input,
  EventEmitter,
  Output
} from "@angular/core";
import { CellDirective } from "./cell.directive";
import { HeaderDirective } from "./header.directive";

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
  @Input("filter") filter = false;

  @Output("onSortChange")
  sortChangeEvent = new EventEmitter<{ column: String; status: String }>();

  sortStatus = "none";

  constructor() {}

  onSortChange() {
    const status = ["none", "asc", "desc"];

    const index = status.indexOf(this.sortStatus);
    this.sortStatus = status[index + 1] || status[0];

    this.sortChangeEvent.emit({ column: this.name, status: this.sortStatus });
  }

  ngOnInit() {}
}
