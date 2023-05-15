import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarMaker } from '../../../types/Car';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef, TableDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class CarMakersTableDataSource extends DialogTableDataSource<CarMaker> {
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

  public loadDataImpl(): Observable<DataResult<CarMaker>> {
    return new Observable((observer) => {
      this.centralServerService.getCarMakers(this.buildFilterValues()).subscribe({
        next: (carMakers) => {
          observer.next(carMakers);
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

  public buildTableDef(): TableDef {
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

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'carMaker',
        name: 'cars.vehicle_make',
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
    ];
  }
}
