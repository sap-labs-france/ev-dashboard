import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Charger, TableColumnDef, TableDef, TableFilterDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ChargersDataSource extends DialogTableDataSource<Charger> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService,
      private spinnerService: SpinnerService) {
    super();
    // Init
    this.initDataSource();
  }

 public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Show spinner
      this.spinnerService.show();
      // Get data
      this.centralServerService.getChargers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
          // Hide spinner
          this.spinnerService.hide();
          // Set number of records
          this.setTotalNumberOfRecords(chargers.count);
          // Ok
          observer.next(chargers.result);
          observer.complete();
        }, (error) => {
          // Hide spinner
          this.spinnerService.hide();
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'chargers.chargers',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.name',
        class: 'text-left'
      }
    ];
  }
}
