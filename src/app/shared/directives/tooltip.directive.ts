import { Directive, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
// import * as $ from 'jquery';
// Here we declare $ as variable to be able to use it after.
// declare var $:any;

@Directive({
  selector:'[appTooltip]'
})
export class TooltipDirective implements AfterViewInit, OnDestroy {

  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    // Wait for Dom Element rendering, then elementRef represent DOM element from where Directive is bootstraped.
    jQuery(this.elementRef.nativeElement).tooltip();
  }

  ngOnDestroy() {
    jQuery(this.elementRef.nativeElement).tooltip('dispose');
  }

}