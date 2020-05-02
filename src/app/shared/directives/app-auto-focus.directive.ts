import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class AppAutofocusDirective implements OnInit {

  constructor(private elementRef: ElementRef) {
  }

  public ngOnInit() {
    this.elementRef.nativeElement.focus();
  }
}
