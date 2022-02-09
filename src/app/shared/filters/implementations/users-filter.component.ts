import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';

import { BaseFilterDef, FilterHttpIDs } from '../../../types/Filters';
import { FiltersService } from '../filters.service';
import { DialogFilterComponent } from '../structures/dialog.component';
import { BaseFilter } from './base-filter.component';

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
      id: 'user',
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
      name: 'logs.user',
      label: '',
      cssClass: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: UsersDialogComponent,
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
