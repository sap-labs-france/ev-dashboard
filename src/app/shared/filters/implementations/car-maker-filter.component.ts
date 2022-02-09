import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CarMakersDialogComponent } from 'shared/dialogs/car-makers/car-makers-dialog.component';

import { SitesDialogComponent } from '../../../shared/dialogs/sites/sites-dialog.component';
import { BaseFilterDef, FilterHttpIDs } from '../../../types/Filters';
import { FiltersService } from '../filters.service';
import { DialogFilterComponent } from '../structures/dialog.component';
import { BaseFilter } from './base-filter.component';

@Component({
  selector: 'app-car-maker-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class CarMakerFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: 'carMakers',
      httpId: FilterHttpIDs.CAR_MAKER,
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
      name: 'cars.car_makers',
      label: '',
      cssClass: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: CarMakersDialogComponent,
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
