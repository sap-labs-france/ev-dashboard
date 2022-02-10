import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs } from '../../../types/Filters';
import { KeyValue } from '../../../types/GlobalType';
import { FiltersService } from '../filters.service';
import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';
import { BaseFilter } from './base-filter.component';

@Component({
  selector: 'app-error-type-filter',
  template: '<app-multiselect-dropdown-filter (dataChanged)="updateService($event)"></app-multiselect-dropdown-filter>'
})
export class ErrorTypeFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(MultiSelectDropdownFilterComponent) msDropdownFilter!: MultiSelectDropdownFilterComponent;

  private items: KeyValue[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: 'errorType',
      httpId: FilterHttpIDs.ERROR_TYPE,
      currentValue: [],
    }
    this.items = this.filtersService.getFilterItemValue(FilterHttpIDs.ERROR_TYPE);
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.msDropdownFilter.setFilter({
      ...this.baseDetails,
      name: 'errors.title',
      label: '',
      cssClass: '',
      items: this.items,
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
