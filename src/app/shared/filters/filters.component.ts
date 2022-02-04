import { AfterViewInit, Component, ComponentFactory, TemplateRef, Type, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';

import { FilterImplementationTypes } from '../../types/Filters';
import { IssuerFilterComponent } from './implementations/IssuerFilter.component';

@Component({
  selector: 'app-filters',
  templateUrl: 'filters.component.html',
})
export class FiltersComponent implements AfterViewInit{

  @ViewChild('filters', { read: ViewContainerRef, static: false }) filterList!: ViewContainerRef;

  constructor(
  ) {
  }

  ngAfterViewInit() {
    console.log(this.filterList);
    this.filterList.createComponent<IssuerFilterComponent>(IssuerFilterComponent as any);
  }

}
