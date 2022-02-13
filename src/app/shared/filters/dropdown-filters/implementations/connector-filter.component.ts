import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { CONNECTORS } from '../../../model/charging-stations.model';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DropdownFilterComponent } from '../dropdown-filter.component';

@Component({
  selector: 'app-status-filter',
  template: '<app-dropdown-filter (dataChanged)="updateService($event)"></app-dropdown-filter>'
})
export class ConnectorFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DropdownFilterComponent) dropdownFilter!: DropdownFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.CONNECTOR,
      httpId: FilterHttpIDs.CONNECTOR,
      currentValue: [],
    }
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.dropdownFilter.setFilter({
      ...this.baseDetails,
      defaultValue: [],
      name: 'chargers.connector',
      label: '',
      cssClass: '',
      items: Object.assign([], CONNECTORS),
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
