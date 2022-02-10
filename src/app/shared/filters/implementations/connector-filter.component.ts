import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs } from '../../../types/Filters';
import { CONNECTORS } from '../../model/charging-stations.model';
import { FiltersService } from '../filters.service';
import { MultiSelectDropdownFilterComponent } from '../structures/multiselect-dropdown-filter.component';
import { BaseFilter } from './base-filter.component';

@Component({
  selector: 'app-status-filter',
  template: '<app-multiselect-dropdown-filter (dataChanged)="updateService($event)"></app-multiselect-dropdown-filter>'
})
export class ConnectorFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(MultiSelectDropdownFilterComponent) msDropdownFilter!: MultiSelectDropdownFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: 'connector',
      httpId: FilterHttpIDs.CONNECTOR,
      currentValue: [],
    }
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.msDropdownFilter.setFilter({
      ...this.baseDetails,
      name: 'chargers.connector',
      label: '',
      cssClass: '',
      items: Object.assign([], CONNECTORS),
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
