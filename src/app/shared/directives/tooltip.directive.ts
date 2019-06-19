import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { Placement } from 'bootstrap';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    let place: Placement = 'left';
    if (this.elementRef.nativeElement.attributes && this.elementRef.nativeElement.attributes['data-placement']) {
      place = this.elementRef.nativeElement.attributes['data-placement'].value;
    }
    jQuery(this.elementRef.nativeElement).tooltip({
      placement: place, trigger: 'hover', sanitize: false, sanitizeFn: content => content
    });
  }

  ngOnDestroy() {
    jQuery(this.elementRef.nativeElement).tooltip('hide');
  }
}
