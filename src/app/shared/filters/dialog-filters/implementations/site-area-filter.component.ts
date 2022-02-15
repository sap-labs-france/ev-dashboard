import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { SiteAreasDialogComponent } from '../../../dialogs/site-areas/site-areas-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-site-area-filter',
  templateUrl: '../base-dialog.component.html'
})
export class SiteAreaFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.SITE_AREA;
    this.httpId = FilterHttpIDs.SITE_AREA;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'site_areas.title';
    this.label = '';
    this.dialogComponent = SiteAreasDialogComponent;
    this.visible = true;
  }

}
