import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[headerButtons]'
})
export class HeaderButtonsDirective {
  template: TemplateRef<any>;

  constructor(private _template: TemplateRef<any>) {
    this.template = this._template;
  }
}
