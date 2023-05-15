import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { DialogTableDataSource } from 'shared/dialogs/dialog-table-data-source';
import { ChargingStation } from 'types/ChargingStation';
import { ChargingStationDataResult } from 'types/DataResult';
import { TableColumnDef } from 'types/Table';
import { Utils } from 'utils/Utils';

@Injectable()
export class ReservableChargingStationsDialogTableDataSource extends DialogTableDataSource<ChargingStation> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<ChargingStationDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getReservableChargingStations(
          this.buildFilterValues(),
          this.getPaging(),
          this.getSorting()
        )
        .subscribe({
          next: (chargers) => {
            observer.next(chargers);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'chargers.chargers',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.vendor',
        class: 'text-left',
      },
      {
        id: 'siteArea.name',
        name: 'chargers.site_area',
        class: 'text-left',
      },
    ];
  }
}
