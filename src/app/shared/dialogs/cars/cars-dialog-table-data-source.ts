import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CarImageFormatterCellComponent } from '../../../pages/cars/cell-components/car-image-formatter-cell.component';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Car } from '../../../types/Car';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class CarsDialogTableDataSource extends DialogTableDataSource<Car> {
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

  public loadDataImpl(): Observable<DataResult<Car>> {
    return new Observable((observer) => {
      this.centralServerService
        .getCars(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (cars) => {
            observer.next(cars);
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
        id: 'carCatalog.image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p p-0',
        isAngularComponent: true,
        angularComponent: CarImageFormatterCellComponent,
      },
      {
        id: 'carCatalog.vehicleMake',
        name: 'cars.vehicle_make',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'carCatalog.vehicleModel',
        name: 'cars.vehicle_model',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (modelVersion: string) => (modelVersion ? modelVersion : '-'),
      },
      {
        id: 'carCatalog.vehicleModelVersion',
        name: 'cars.vehicle_model_version',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (vehicleModelVersion: string) =>
          vehicleModelVersion ? vehicleModelVersion : '-',
      },
      {
        id: 'licensePlate',
        name: 'cars.license_plate',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
      },
      {
        id: 'vin',
        name: 'cars.vin',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
      },
    ];
  }
}
