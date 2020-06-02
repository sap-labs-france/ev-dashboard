import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { ChargerTableFilter } from 'app/shared/table/filters/charger-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { ComponentService } from '../../../services/component.service';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingPlansCurrentLimitCellComponent } from '../cell-components/charging-plans-current-limit-cell.component';
import { ChargingPlansSiteAreaLimitCellComponent } from '../cell-components/charging-plans-site-area-limit-cell.component';
import { ChargingStationChargingLimitDialogComponent } from '../charging-limit/charging-station-charging-limit.dialog.component';
import { TableChargingStationsSmartChargingAction } from '../table-actions/table-charging-stations-smart-charging-action';
import { TableExportChargingStationsAction } from '../table-actions/table-export-charging-stations-action';

@Injectable()
export class ChargingPlansListTableDataSource extends TableDataSource<ChargingProfile> {
  private readonly isOrganizationComponentActive: boolean;
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private unitPipe: AppUnitPipe,
  ) {
    super(spinnerService, translateService);
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{WithChargingStation: 'true'}, {WithSiteArea: 'true'}]);
    } else {
      this.setStaticFilters([{WithChargingStation: 'true'}]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingProfiles();
  }

  public loadDataImpl(): Observable<DataResult<ChargingProfile>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingProfiles(this.buildFilterValues()).subscribe((chargingProfiles) => {
          // Ok
          observer.next(chargingProfiles);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      rowDetails: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    let tableColumns: TableColumnDef[] = [

      {
        id: 'chargingStationID',
        name: 'chargers.smart_charging.charging_plans.charging_station_id',
        sortable: false,
      },
      {
        id: 'connectorID',
        name: 'chargers.smart_charging.charging_plans.connector_id',
        sortable: false,
      },
      {
        id: 'profile.chargingSchedule.chargingSchedulePeriod',
        name: 'chargers.smart_charging.charging_plans.current_limit',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingPlansCurrentLimitCellComponent,
      },
    ];
    if (this.isOrganizationComponentActive) {
      tableColumns.push(
        {
          id: 'siteArea.name',
          name: 'chargers.smart_charging.charging_plans.site_area',
          sortable: true,
        },
        {
          id: 'siteArea.maximumPower',
          name: 'chargers.smart_charging.charging_plans.site_area_limit',
          sortable: false,
          isAngularComponent: true,
          angularComponent: ChargingPlansSiteAreaLimitCellComponent,
        },
      );
    }
    return tableColumns;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      return [
        new TableExportChargingStationsAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }


  public rowActionTriggered(actionDef: TableActionDef, chargingProfile: ChargingProfile) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SMART_CHARGING:
        this.dialogSmartCharging(chargingProfile);
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        new ChargerTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public buildTableDynamicRowActions(chargingProfile: ChargingProfile): TableActionDef[] {
    if (!chargingProfile) {
      return [];
    }
    if (this.authorizationService.isAdmin() ||
      this.authorizationService.isSiteAdmin(chargingProfile.siteArea ? chargingProfile.siteArea.siteID : '')) {
      return [
        this.smartChargingAction,
      ];
    }
  }

  private dialogSmartCharging(chargingProfile: ChargingProfile) {
    if (parseFloat(chargingProfile.chargingStation.ocppVersion) < 1.6) {
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.smart_charging_title'),
        this.translateService.instant('chargers.action_error.smart_charging_charger_version'));
    } else {
      // Create the dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.minWidth = '80vw';
      dialogConfig.minHeight = '60vh';
      dialogConfig.maxHeight = '90vh';
      dialogConfig.panelClass = 'transparent-dialog-container';
      if (chargingProfile.chargingStation) {
        dialogConfig.data = chargingProfile.chargingStation.id;
      }
      // disable outside click close
      dialogConfig.disableClose = true;
      // Open
      const dialogRef = this.dialog.open(ChargingStationChargingLimitDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(() => {
        this.refreshData().subscribe();
      });
    }
  }
}
