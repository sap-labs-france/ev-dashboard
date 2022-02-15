import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { ReportsDialogComponent } from '../../../dialogs/reports/reports-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-reports-filter',
  templateUrl: '../base-dialog.component.html'
})
export class ReportsFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.REPORTS;
    this.httpId = FilterHttpIDs.REPORTS;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'transactions.reportId';
    this.label = '';
    this.dialogComponent = ReportsDialogComponent;
    this.visible = true;
  }

}
