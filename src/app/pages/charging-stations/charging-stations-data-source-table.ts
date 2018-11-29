import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {Charger, Connector, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {DialogService} from '../../services/dialog.service';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {InstantPowerProgressBarComponent} from './cell-content-components/instant-power-progress-bar.component';
import {ConnectorsDetailComponent} from './details-content-component/connectors-detail-component.component';
import {HeartbeatCellComponent} from './cell-content-components/heartbeat-cell.component';
import {ConnectorsCellComponent} from './cell-content-components/connectors-cell.component';
import {TableEditAction} from '../../shared/table/actions/table-edit-action';
import {TableDeleteAction} from '../../shared/table/actions/table-delete-action';
import { TableGetConfigurationAction } from "./actions/get-configuration-action";
import {ChargerTableFilter} from '../../shared/table/filters/charger-filter';
import {SitesTableFilter} from '../../shared/table/filters/site-filter';
import { ChargingStationDialogComponent } from "./charging-station/charging-station.dialog.component";
import { Injectable } from '@angular/core';

@Injectable()
export class ChargingStationsDataSource extends TableDataSource<Charger> {
  private readonly tableActionsRow: TableActionDef[];

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super();
    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
    this.setStaticFilters([{'WithSite': true}]);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get data
    this.centralServerService.getChargers(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((chargers) => {
      // Show
      this.spinnerService.hide();
      // Set number of records
      this.setNumberOfRecords(chargers.count);
      // Update page length
      this.updatePaginator();
      // Return logs
      this.getDataSubjet().next(chargers.result);
      // Keep the result
      this.setData(chargers.result);
    }, (error) => {
      // Show
      this.spinnerService.hide();
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        this.translateService.instant('general.error_backend'));
    });
  }

  public getConnectors(id): Observable<Connector> {
    this.getData().forEach(charger => {
      if (charger.id === id) {
        return charger;
      }
    });
    return null;
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowSelection: {
        enabled: true,
        multiple: true
      },
      rowDetails: {
        enabled: true,
        isDetailComponent: true,
        detailComponentName: ConnectorsDetailComponent
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    return [
      {
        id: 'id',
        name: 'chargers.name',
        sortable: true,
        headerClass: 'col-15p',
        dynamicClass: (row: Charger) => {
          return (row.siteArea ? 'col-15p' : 'col-15p charger-not-assigned');
        }
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        isAngularComponent: true,
        angularComponentName: HeartbeatCellComponent,
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        isAngularComponent: true,
        angularComponentName: ConnectorsCellComponent
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        class: 'charger-connector col-20p',
        isAngularComponent: true,
        angularComponentName: InstantPowerProgressBarComponent
      },
      {
        id: 'siteArea.site.name',
        name: 'sites.site',
        sortable: false,
        defaultValue: 'sites.unassigned',
        formatter: (value) => {
          if (value === 'sites.unassigned') {
            return this.translateService.instant(value)
          } else {
            return value;
          }
        },
        dynamicClass: (row: Charger) => {
          return (row.siteArea ? '' : 'charger-not-assigned');
        }
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        sortable: false,
        defaultValue: 'site_areas.unassigned',
        formatter: (value) => {
          if (value === 'site_areas.unassigned') {
            return this.translateService.instant(value)
          } else {
            return value;
          }
        },
        dynamicClass: (row: Charger) => {
          return (row.siteArea ? '' : 'charger-not-assigned');
        }
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.vendor',
        sortable: true
      }, {
        id: 'chargePointModel',
        name: 'chargers.model',
        sortable: true
      }
    ];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableDeleteAction().getActionDef(),
      new TableGetConfigurationAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Delete
      case 'delete':
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
      this._showChargingStationDialog(rowItem);
        break;
      case 'delete':
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new ChargerTableFilter().getFilterDef(),
      new SitesTableFilter().getFilterDef()
    ];
  }

  private _showChargingStationDialog(chargingStation?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    if (chargingStation) {
      dialogConfig.data = chargingStation.id;
    }
    // Open
    const dialogRef = this.dialog.open(ChargingStationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }
}
