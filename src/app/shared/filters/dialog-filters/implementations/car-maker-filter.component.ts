import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { CarMakersDialogComponent } from '../../../dialogs/car-makers/car-makers-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-car-maker-filter',
  templateUrl: '../base-dialog.component.html'
})
export class CarMakerFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.CAR_MAKER;
    this.httpId = FilterHttpIDs.CAR_MAKER;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'cars.car_makers';
    this.label = '';
    this.dialogComponent = CarMakersDialogComponent;
    this.visible = true;
  }

}
