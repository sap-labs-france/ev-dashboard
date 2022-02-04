import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';

@Component({
  selector: 'app-issuer-filter',
  template: '<div #parent><app-multi-dropdown-filter></app-multi-dropdown-filter></div>'
})
export class IssuerFilterComponent implements AfterViewInit{

  @ViewChild(MultiSelectDropdownFilterComponent) multiSelectDropdownFilter: MultiSelectDropdownFilterComponent;


  ngAfterViewInit(){
    this.initFilter();
  }

  private initFilter() {
    this.multiSelectDropdownFilter.initFilter({
      id: 'issuer',
      name: 'issuer.title',
      currentValue: [],
      label: 'Issuer',
      items: [
        { key: 'true', value: 'issuer.local' },
        { key: 'false', value: 'issuer.foreign' },
      ],
      multiple: true,
    })
  }
}
