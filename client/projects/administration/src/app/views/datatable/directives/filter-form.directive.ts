import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[filterForm]'
})
export class FilterFormDirective {
  template: TemplateRef<any>;

  constructor(private _template: TemplateRef<any>) {
    this.template = this._template;
  }
}