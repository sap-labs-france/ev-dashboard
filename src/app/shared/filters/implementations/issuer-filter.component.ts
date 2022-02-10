import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { BaseFilterDef, FilterHttpIDs } from 'types/Filters';

import { FiltersService } from '../filters.service';
import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';
import { BaseFilter } from './base-filter.component';

@Component({
  selector: 'app-issuer-filter',
  template: '<app-multiselect-dropdown-filter (dataChanged)="updateService($event)"></app-multiselect-dropdown-filter>'
})
export class IssuerFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(MultiSelectDropdownFilterComponent) msDropdownFilter!: MultiSelectDropdownFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: 'issuer',
      httpId: FilterHttpIDs.ISSUER,
      currentValue: []
    }
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.msDropdownFilter.setFilter({
      ...this.baseDetails,
      name: 'issuer.title',
      label: '',
      cssClass: '',
      items: [
        { key: 'true', value: 'issuer.local' },
        { key: 'false', value: 'issuer.foreign' },
      ],
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
