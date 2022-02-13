import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { TagsDialogComponent } from '../../../dialogs/tags/tags-dialog.component';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DialogFilterComponent } from '../dialog.component';

@Component({
  selector: 'app-tags-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class TagsFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.TAG,
      httpId: FilterHttpIDs.TAG,
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
      name: 'users.tags',
      label: '',
      cssClass: '',
      dialogComponent: TagsDialogComponent,
      dependentFilters: [
        FilterHttpIDs.ISSUER,
        FilterHttpIDs.SITE,
        FilterHttpIDs.USER
      ]
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
