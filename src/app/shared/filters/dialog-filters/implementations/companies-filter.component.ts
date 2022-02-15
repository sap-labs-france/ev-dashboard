import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { CompaniesDialogComponent } from '../../../dialogs/companies/companies-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-companies-filter',
  templateUrl: '../base-dialog.component.html'
})
export class CompaniesFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.COMPANY;
    this.httpId = FilterHttpIDs.COMPANY;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'companies.title';
    this.label = '';
    this.dialogComponent = CompaniesDialogComponent;
    this.visible = true;
  }

}
