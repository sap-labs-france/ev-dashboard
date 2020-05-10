import { CentralServerService } from '../../../services/central-server.service';
import { ChargingStation } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { DialogTableDataSource } from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableColumnDef } from 'app/types/Table';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class ChargersDialogTableDataSource extends DialogTableDataSource<ChargingStation> {
  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<ChargingStation>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingStations(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
          // Ok
          observer.next(chargers);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
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
        name: 'chargers.name',
        class: 'text-left',
      },
    ];
  }
}
