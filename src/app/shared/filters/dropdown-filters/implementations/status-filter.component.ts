import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DropdownFilterComponent } from '../dropdown-filter.component';

@Component({
  selector: 'app-status-filter',
  template: '<app-dropdown-filter (dataChanged)="updateService($event)"></app-dropdown-filter>'
})
export class StatusFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DropdownFilterComponent) dropdownFilter!: DropdownFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.STATUS,
      httpId: FilterHttpIDs.STATUS,
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
      name: 'tags.status',
      label: '',
      cssClass: '',
      items: [
        { key: 'true', value: 'tags.activated' },
        { key: 'false', value: 'tags.deactivated' },
      ],
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
