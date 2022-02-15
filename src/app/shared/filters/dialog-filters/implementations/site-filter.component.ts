import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { KeyValue } from '../../../../types/GlobalType';
import { SitesDialogComponent } from '../../../dialogs/sites/sites-dialog.component';
import { FiltersService } from '../../filters.service';
import { BaseDialogFilterComponent } from '../base-dialog.component';

@Component({
  selector: 'app-site-filter',
  templateUrl: '../base-dialog.component.html'
})
export class SiteFilterComponent extends BaseDialogFilterComponent{

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
    this.id = FilterIDs.SITE;
    this.httpId = FilterHttpIDs.SITE;
    this.currentValue = [];
    this.defaultValue = [];
    this.name = 'sites.titles';
    this.label = '';
    this.dialogComponent = SitesDialogComponent;
    this.visible = true;
  }

}
