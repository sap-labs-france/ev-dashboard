import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appCellContentTemplate]',
})
export class CellContentTemplateDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

