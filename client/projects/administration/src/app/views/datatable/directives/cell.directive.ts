import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[cell]"
})
export class CellDirective {
  template: TemplateRef<any>;

  constructor(private _template: TemplateRef<any>) {
    this.template = this._template;
  }
}
