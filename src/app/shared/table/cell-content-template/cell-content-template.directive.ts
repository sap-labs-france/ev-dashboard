import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[cell-content-template]',
})
export class CellContentTemplateDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

