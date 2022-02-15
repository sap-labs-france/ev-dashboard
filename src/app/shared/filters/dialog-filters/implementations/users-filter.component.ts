import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { UsersDialogComponent } from '../../../dialogs/users/users-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-users-filter',
  templateUrl: '../base-dialog.component.html'
})
export class UsersFilterComponent extends BaseDialogFilterComponent{

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
    dialog: MatDialog,
  ) {
    super(dialog, filtersService);
    this.id = FilterIDs.USER;
    this.httpId = FilterHttpIDs.USER;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'logs.user';
    this.label = '';
    this.dialogComponent = UsersDialogComponent;
    this.visible = true;
  }

}
