import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogMode, DialogParamsWithAuth, SiteAreasAuthorizations } from 'types/Authorization';

import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableAssignAssetsToSiteAreaActionDef extends TableActionDef {
  action: (
    siteAreaAssetsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableAssignAssetsToSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableAssignAssetsToSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.ASSIGN_ASSETS_TO_SITE_AREA,
      icon: 'account_balance',
      name: 'site_areas.edit_assets',
      tooltip: 'general.tooltips.edit_assets',
      action: this.assignAssetsToSiteArea,
    };
  }

  private assignAssetsToSiteArea(
    siteAreaAssetsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.assign(siteAreaAssetsDialogComponent, dialog, dialogParams, DialogMode.EDIT, refresh);
  }
}
