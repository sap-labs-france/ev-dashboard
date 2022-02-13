import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';

import { FilterHttpIDs, FilterIDs } from '../../types/Filters';
import { DateTimeRangeFilterComponent } from './date-range-filters/implementations/date-time-range-filter.component';
import { CarMakerFilterComponent } from './dialog-filters/implementations/car-maker-filter.component';
import { ChargingStationFilterComponent } from './dialog-filters/implementations/charging-station-filter.component';
import { CompaniesFilterComponent } from './dialog-filters/implementations/companies-filter.component';
import { ReportsFilterComponent } from './dialog-filters/implementations/reports-filter.component';
import { SiteAreaFilterComponent } from './dialog-filters/implementations/site-area-filter.component';
import { SiteFilterComponent } from './dialog-filters/implementations/site-filter.component';
import { TagsFilterComponent } from './dialog-filters/implementations/tags-filter.component';
import { UsersFilterComponent } from './dialog-filters/implementations/users-filter.component';
import { ConnectorFilterComponent } from './dropdown-filters/implementations/connector-filter.component';
import { ErrorTypeFilterComponent } from './dropdown-filters/implementations/error-type-filter.component';
import { IssuerFilterComponent } from './dropdown-filters/implementations/issuer-filter.component';
import { StatusFilterComponent } from './dropdown-filters/implementations/status-filter.component';
import { FiltersService } from './filters.service';

@Component({
  selector: 'app-filters',
  templateUrl: 'filters.component.html',
})
export class FiltersComponent implements AfterViewInit{

  @ViewChild('filters', { read: ViewContainerRef, static: false }) filtersList!: ViewContainerRef;

  private filterComponentList: any = {
    [FilterIDs.ISSUER]: IssuerFilterComponent,
    [FilterIDs.STATUS]: StatusFilterComponent,
    [FilterIDs.CONNECTOR]: ConnectorFilterComponent,
    [FilterIDs.ERROR_TYPE]: ErrorTypeFilterComponent,
    [FilterIDs.SITE]: SiteFilterComponent,
    [FilterIDs.CAR_MAKER]: CarMakerFilterComponent,
    [FilterIDs.CHARGING_STATION]: ChargingStationFilterComponent,
    [FilterIDs.COMPANY]: CompaniesFilterComponent,
    [FilterIDs.REPORTS]: ReportsFilterComponent,
    [FilterIDs.SITE_AREA]: SiteAreaFilterComponent,
    [FilterIDs.TAG]: TagsFilterComponent,
    [FilterIDs.USER]: UsersFilterComponent,
    [FilterIDs.DATE_RANGE]: DateTimeRangeFilterComponent,
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
  }

  ngAfterViewInit() {
    for(const filterType of this.filtersService.getFilterList()) {
      const fType = this.filterComponentList[filterType];
      const resolvedComponent = this.componentFactoryResolver.resolveComponentFactory(this.filterComponentList[filterType]);
      this.filtersList.createComponent<typeof fType>(resolvedComponent);
    }
    this.changeDetectorRef.detectChanges();
  }

}
