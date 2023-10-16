import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  DialogMode,
  DialogParamsWithAuth,
  SiteAreasAuthorizations,
} from '../../../../types/Authorization';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableViewAssignedAssetsOfSiteAreaActionDef extends TableActionDef {
  action: (
    siteAreaAssetsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewAssignedAssetsOfSiteAreaAction extends TableAssignAction {
  public getActionDef(): TableViewAssignedAssetsOfSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_ASSETS_OF_SITE_AREA,
      icon: 'account_balance',
      name: 'site_areas.display_assets',
      tooltip: 'general.tooltips.display_assets',
      action: this.viewAssignedAssetsOfSiteArea,
    };
  }

  private viewAssignedAssetsOfSiteArea(
    siteAreaAssetsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.assign(siteAreaAssetsDialogComponent, dialog, dialogParams, DialogMode.VIEW, refresh);
  }
}
