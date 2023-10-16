import { Injectable } from '@angular/core';
import { ChargePointStatus, ChargingStation, Connector } from 'types/ChargingStation';
import { SpinnerService } from 'services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'services/message.service';
import { Router } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { Observable, map } from 'rxjs';
import { DataResult } from 'types/DataResult';
import { TableColumnDef } from 'types/Table';
import { Utils } from 'utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class ChargingStationConnectorsDialogTableDataSource extends DialogTableDataSource<Connector> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Connector>> {
    return new Observable((observer) => {
      const id = this.buildFilterValues()['id'].toString();
      this.centralServerService
        .getChargingStation(id)
        .pipe(
          map<ChargingStation, Connector[]>((chargingStation) =>
            chargingStation.connectors.filter(
              (connector) => connector.status !== ChargePointStatus.UNAVAILABLE
            )
          )
        )
        .subscribe({
          next: (connectors) => {
            observer.next({
              count: connectors.length,
              result: connectors,
            });
            observer.complete();
          },
        });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        class: 'text-left',
        formatter: (connectorID: number) => Utils.getConnectorLetterFromConnectorID(connectorID),
      },
      {
        id: 'type',
        name: 'chargers.connector_type',
        class: 'text-left',
        formatter: (connectorType: string) =>
          Utils.getConnectorType(this.translateService, connectorType),
      },
      {
        id: 'status',
        name: 'reservations.connector_status',
        class: 'text-left',
      },
      {
        id: 'amperage',
        name: 'chargers.amperage',
        class: 'text-left',
      },
    ];
  }
}
