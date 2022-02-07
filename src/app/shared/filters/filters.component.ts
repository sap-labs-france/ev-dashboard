import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, HostListener, Renderer2, TemplateRef, Type, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';

import { FilterImplementationTypes } from '../../types/Filters';
import { IssuerFilterComponent } from './implementations/IssuerFilter.component';
import { StatusFilterComponent } from './implementations/StatusFilter.component';

@Component({
  selector: 'app-filters',
  templateUrl: 'filters.component.html',
})
export class FiltersComponent implements AfterViewInit{

  @ViewChild('filters', { read: ViewContainerRef, static: false }) filterList!: ViewContainerRef;

  @HostListener('dataChanged')
  onDataChanged(event: any) {
    console.log(event);
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer2: Renderer2
  ) {
  }

  ngAfterViewInit() {
    const componentRef = this.filterList.createComponent<IssuerFilterComponent>(
      this.componentFactoryResolver.resolveComponentFactory(IssuerFilterComponent)
    );
    this.renderer2.listen(componentRef.location.nativeElement, 'dataChanged', (event: any) => {
      console.log(event);
    })
    this.changeDetectorRef.detectChanges();
    // const componentFactory2 = this.componentFactoryResolver.resolveComponentFactory(StatusFilterComponent);
    // this.filterList.createComponent<StatusFilterComponent>(componentFactory2);
  }

}
