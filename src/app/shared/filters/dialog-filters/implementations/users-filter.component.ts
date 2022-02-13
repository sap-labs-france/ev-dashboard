import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { UsersDialogComponent } from '../../../dialogs/users/users-dialog.component';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DialogFilterComponent } from '../dialog.component';

@Component({
  selector: 'app-users-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class UsersFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.USER,
      httpId: FilterHttpIDs.USER,
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
      name: 'logs.user',
      label: '',
      cssClass: '',
      dialogComponent: UsersDialogComponent,
      dependentFilters: [
        FilterHttpIDs.ISSUER,
        FilterHttpIDs.SITE
      ]
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
