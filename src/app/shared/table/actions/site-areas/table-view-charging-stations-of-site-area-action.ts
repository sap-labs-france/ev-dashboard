import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, SiteAreasAuthorizations } from '../../../../types/Authorization';
import { SiteArea, SiteAreaButtonAction } from '../../../../types/SiteArea';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewChargingStationsOfSiteAreaActionDef extends TableActionDef {
  action: (
    siteAreaChargingStationsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewChargingStationsOfSiteAreaAction extends TableViewAction {
  public getActionDef(): TableViewChargingStationsOfSiteAreaActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA,
      icon: 'ev_station',
      tooltip: 'general.tooltips.display_chargers',
      action: this.viewChargingStations,
    };
  }

  private viewChargingStations(
    siteAreaChargingStationsDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<SiteArea, SiteAreasAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.view(siteAreaChargingStationsDialogComponent, dialog, dialogParams, refresh);
  }
}
