import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { SiteAreasDialogComponent } from '../../../dialogs/site-areas/site-areas-dialog.component';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DialogFilterComponent } from '../dialog.component';

@Component({
  selector: 'app-site-area-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class SiteAreaFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.SITE_AREA,
      httpId: FilterHttpIDs.SITE_AREA,
      currentValue: [],
    }
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.dialogFilter.setFilter({
      ...this.baseDetails,
      defaultValue: [],
      name: 'site_areas.title',
      label: '',
      cssClass: '',
      dialogComponent: SiteAreasDialogComponent,
      dependentFilters: [
        FilterHttpIDs.COMPANY,
        FilterHttpIDs.ISSUER,
        FilterHttpIDs.SITE,
      ]
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
