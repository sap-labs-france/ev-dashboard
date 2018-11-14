import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[appSetAutoFocus]'
})
export class AppAutofocusDirective implements OnInit {

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.elementRef.nativeElement.focus();
  }
}
