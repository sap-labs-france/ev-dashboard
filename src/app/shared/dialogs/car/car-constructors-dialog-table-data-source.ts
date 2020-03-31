import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult } from 'app/types/DataResult';
import { Site } from 'app/types/Site';
import { TableColumnDef, TableDef } from 'app/types/Table';
import { Observable } from 'rxjs';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';
import { CarConstructorsTable } from 'app/types/Car';

@Injectable()
export class CarConstructorsTableDataSource extends DialogTableDataSource<CarConstructorsTable> {
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

  public loadDataImpl(): Observable<DataResult<CarConstructorsTable>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getCarConstructors(this.buildFilterValues()).subscribe((carConstructors) => {
          // Ok
          observer.next({
            count: carConstructors.length,
            result: carConstructors,
          });
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'vehicleMake',
        name: 'cars.vehicle_make',
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: false,
      }
    ];
  }
}
