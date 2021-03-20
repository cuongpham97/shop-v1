import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[footer]"
})
export class FooterDirective {
  template: TemplateRef<any>;

  constructor(private _template: TemplateRef<any>) {
    this.template = this._template;
  }
}
