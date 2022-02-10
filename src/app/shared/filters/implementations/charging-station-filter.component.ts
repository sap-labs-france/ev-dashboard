import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ChargingStationsDialogComponent } from 'shared/dialogs/charging-stations/charging-stations-dialog.component';

import { BaseFilterDef, FilterHttpIDs } from '../../../types/Filters';
import { FiltersService } from '../filters.service';
import { DialogFilterComponent } from '../structures/dialog.component';
import { BaseFilter } from './base-filter.component';

@Component({
  selector: 'app-charging-station-filter',
  template: '<app-dialog-filter (dataChanged)="updateService($event)"></app-dialog-filter>'
})
export class ChargingStationFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DialogFilterComponent) dialogFilter!: DialogFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: 'charger',
      httpId: FilterHttpIDs.CHARGING_STATION,
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
      name: 'chargers.title',
      label: '',
      cssClass: '',
      dialogComponent: ChargingStationsDialogComponent,
      multiple: true,
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
