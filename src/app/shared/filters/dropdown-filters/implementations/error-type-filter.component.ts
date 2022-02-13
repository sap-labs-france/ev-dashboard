import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DropdownFilterComponent } from '../dropdown-filter.component';

@Component({
  selector: 'app-error-type-filter',
  template: '<app-dropdown-filter (dataChanged)="updateService($event)"></app-dropdown-filter>'
})
export class ErrorTypeFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DropdownFilterComponent) dropdownFilter!: DropdownFilterComponent;

  private items: KeyValue[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.ERROR_TYPE,
      httpId: FilterHttpIDs.ERROR_TYPE,
      currentValue: [],
    }
    this.items = this.filtersService.getFilterItemValue(FilterIDs.ERROR_TYPE);
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.dropdownFilter.setFilter({
      ...this.baseDetails,
      defaultValue: [],
      name: 'errors.title',
      label: '',
      cssClass: '',
      items: this.items,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
