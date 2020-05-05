import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import * as jQuery from 'jquery';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  constructor(private elementRef: ElementRef) {
  }

  public ngAfterViewInit() {
    jQuery(this.elementRef.nativeElement).tooltip({
      placement: 'bottom', trigger: 'hover', sanitize: false, sanitizeFn: (content) => content,
    });
  }

  public ngOnDestroy() {
    jQuery(this.elementRef.nativeElement).tooltip('dispose');
  }
}
