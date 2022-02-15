import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { ChargingStationsDialogComponent } from '../../../dialogs/charging-stations/charging-stations-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-charging-station-filter',
  templateUrl: '../base-dialog.component.html'
})
export class ChargingStationFilterComponent extends BaseDialogFilterComponent{

  public id: string;
  public label: string;
  public visible: boolean;
  public cssClass: string;
  public name: string;
  public httpId: FilterHttpIDs;
  public currentValue: KeyValue[];
  public defaultValue: KeyValue[];
  public dialogComponent: any;
  public dialogComponentData?: any;

  constructor(
    filtersService: FiltersService,
    dialog: MatDialog
  ) {
    super(dialog, filtersService);
    this.id = FilterIDs.CHARGING_STATION;
    this.httpId = FilterHttpIDs.CHARGING_STATION;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'chargers.title';
    this.label = '';
    this.dialogComponent = ChargingStationsDialogComponent;
    this.visible = true;
  }

}
