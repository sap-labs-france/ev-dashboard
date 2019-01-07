import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appDetailComponent]',
})
export class DetailComponentDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

