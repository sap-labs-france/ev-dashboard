import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../shared/table/table-data-source';
import { Charger, Connector, SubjectInfo, TableColumnDef, TableActionDef, TableFilterDef, TableDef } from '../../common.types';
import { CentralServerNotificationService } from '../../services/central-server-notification.service';
import { TableAutoRefreshAction } from '../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Utils } from '../../utils/Utils';
import { ConsumptionProgressBarComponent } from './cell-content-components/consumption-progress-bar.component';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { HeartbeatCellComponent } from './cell-content-components/heartbeat-cell.component';

export class ChargingStationsDataSource extends TableDataSource<Charger> {

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService
  ) {
    super();
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

  public getConnectors(id): Observable<Connector>  {
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
    let nbTotalKW = 0;
    let nbUsedKW = 0;
    nbUsedKW = 0;
    const centralServerService = this.centralServerService;
    return [
      {
        id: 'id',
        name: this.translateService.instant('chargers.name'),
        class: 'col-150px',
        sortable: true
      },
      {
        id: 'inactive',
        name: this.translateService.instant('chargers.status_available'),
        isAngularComponent: true,
        angularComponentName: HeartbeatCellComponent,
        class: 'col-250px',
        sortable: true
      },
      {
        id: 'connectors',
        name: this.translateService.instant('chargers.connector'),
        formatter: (connectors: Connector[], row: Charger) => {
          let nbTotalConnectors = 0;
          let nbUsedConnectors = 0;
          let connectorHTML = '';
          if (Array.isArray(connectors)) {
            nbTotalKW = 0;
            nbUsedKW = 0;
            nbTotalConnectors = connectors.length;
            connectors.forEach(connector => {
              if (connector.activeTransactionID) {
                nbUsedConnectors++
              };
              nbTotalKW += connector.power;
              nbUsedKW += connector.currentConsumption;
              const classUsage = (connector.activeTransactionID > 0 ? 'charger-connector-busy' : 'charger-connector-available');
              connectorHTML += `<img class='charger-connector ${classUsage}'
                src='${centralServerService.getChargerConnectorTypeByKey(connector.type).image}'/>`;
            });
          }
          return connectorHTML;
        },
        class: 'charger-connector col-150px'
      },
      {
        id: 'connectorsConsumption',
        name: this.translateService.instant('chargers.charger_kw'),
        class: 'col-150px',
        isAngularComponent: true,
        angularComponentName: ConsumptionProgressBarComponent,
        sortable: true
      },
      {
        id: 'chargePointVendor',
        name: this.translateService.instant('chargers.vendor'),
        class: 'col-250px',
        sortable: true
      }
    ];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
