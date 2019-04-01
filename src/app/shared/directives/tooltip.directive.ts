import {AfterViewInit, Directive, ElementRef, OnDestroy} from '@angular/core';
import {Placement} from 'bootstrap';
// import * as $ from 'jquery';
// Here we declare $ as variable to be able to use it after.
// declare var $:any;

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements AfterViewInit, OnDestroy {

  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    // Wait for Dom Element rendering, then elementRef represent DOM element from where Directive is bootstraped.
    console.log('call directive');
    let place: Placement = 'left';
    if (this.elementRef.nativeElement.attributes && this.elementRef.nativeElement.attributes['data-placement']) {
      place = this.elementRef.nativeElement.attributes['data-placement'].value;
    }
    jQuery(this.elementRef.nativeElement).tooltip({placement: place, trigger: 'hover'});
  }

  ngOnDestroy() {
    jQuery(this.elementRef.nativeElement).tooltip('dispose');
  }

}
