import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[detail-component]',
})
export class DetailComponentDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

