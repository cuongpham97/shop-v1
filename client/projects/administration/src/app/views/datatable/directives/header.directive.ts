import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[header]"
})
export class HeaderDirective {
  template: TemplateRef<any>;

  constructor(private _template: TemplateRef<any>) {
    this.template = this._template;
  }
}
