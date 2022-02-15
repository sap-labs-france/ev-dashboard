import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { TagsDialogComponent } from '../../../dialogs/tags/tags-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-tags-filter',
  templateUrl: '../base-dialog.component.html'
})
export class TagsFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.TAG;
    this.httpId = FilterHttpIDs.TAG;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'users.tags';
    this.label = '';
    this.dialogComponent = TagsDialogComponent;
    this.visible = true;
  }

}
