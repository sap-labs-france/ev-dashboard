import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FilterValue } from 'types/Filters';

import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';

@Component({
  selector: 'app-issuer-filter',
  template: '<app-multiselect-dropdown-filter></app-multiselect-dropdown-filter>'
})
export class IssuerFilterComponent implements AfterViewInit{

  @ViewChild(MultiSelectDropdownFilterComponent) msDropdownFilter!: MultiSelectDropdownFilterComponent;


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  private initFilter() {
    Object.assign(this.msDropdownFilter.filter, {
      id: 'issuer',
      httpId: 'Issuer',
      name: 'issuer.title',
      currentValue: [],
      label: '',
      cssClass: 'col-md-6 col-lg-2 col-xl-2',
      items: [
        { key: 'true', value: 'issuer.local' },
        { key: 'false', value: 'issuer.foreign' },
      ],
      multiple: true,
    });
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
