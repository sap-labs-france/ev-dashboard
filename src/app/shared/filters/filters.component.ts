import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { FilterHttpIDs } from 'types/Filters';

import { FiltersService } from './filters.service';
import { CarMakerFilterComponent } from './implementations/car-maker-filter.component';
import { ChargingStationFilterComponent } from './implementations/charging-station-filter.component';
import { CompaniesFilterComponent } from './implementations/companies-filter.component';
import { ConnectorFilterComponent } from './implementations/connector-filter.component';
import { ErrorTypeFilterComponent } from './implementations/error-type-filter.component';
import { IssuerFilterComponent } from './implementations/issuer-filter.component';
import { ReportsFilterComponent } from './implementations/reports-filter.component';
import { SiteAreaFilterComponent } from './implementations/site-area-filter.component';
import { SiteFilterComponent } from './implementations/site-filter.component';
import { StatusFilterComponent } from './implementations/status-filter.component';
import { TagsFilterComponent } from './implementations/tags-filter.component';
import { UsersFilterComponent } from './implementations/users-filter.component';

@Component({
  selector: 'app-filters',
  templateUrl: 'filters.component.html',
})
export class FiltersComponent implements AfterViewInit{

  @ViewChild('filters', { read: ViewContainerRef, static: false }) filtersList!: ViewContainerRef;

  private filterComponentList: any = {
    [FilterHttpIDs.ISSUER]: IssuerFilterComponent,
    [FilterHttpIDs.STATUS]: StatusFilterComponent,
    [FilterHttpIDs.CONNECTOR]: ConnectorFilterComponent,
    [FilterHttpIDs.ERROR_TYPE]: ErrorTypeFilterComponent,
    [FilterHttpIDs.SITE]: SiteFilterComponent,
    [FilterHttpIDs.CAR_MAKER]: CarMakerFilterComponent,
    [FilterHttpIDs.CHARGING_STATION]: ChargingStationFilterComponent,
    [FilterHttpIDs.COMPANY]: CompaniesFilterComponent,
    [FilterHttpIDs.REPORTS]: ReportsFilterComponent,
    [FilterHttpIDs.SITE_AREA]: SiteAreaFilterComponent,
    [FilterHttpIDs.TAG]: TagsFilterComponent,
    [FilterHttpIDs.USER]: UsersFilterComponent,
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
