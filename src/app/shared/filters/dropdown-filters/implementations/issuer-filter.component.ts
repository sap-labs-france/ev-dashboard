import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs } from '../../../../types/Filters';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DropdownFilterComponent } from '../dropdown-filter.component';

@Component({
  selector: 'app-issuer-filter',
  template: '<app-dropdown-filter (dataChanged)="updateService($event)"></app-dropdown-filter>'
})
export class IssuerFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DropdownFilterComponent) dropdownFilter!: DropdownFilterComponent;

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
    this.dropdownFilter.setFilter({
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
