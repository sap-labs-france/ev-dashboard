import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { SitesDialogComponent } from '../../../dialogs/sites/sites-dialog.component';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DialogFilterComponent } from '../dialog.component';

@Component({
  selector: 'app-site-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class SiteFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.SITE,
      httpId: FilterHttpIDs.SITE,
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
      name: 'sites.titles',
      label: '',
      cssClass: '',
      dialogComponent: SitesDialogComponent,
      dependentFilters: [
        FilterHttpIDs.COMPANY,
        FilterHttpIDs.ISSUER
      ]
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
