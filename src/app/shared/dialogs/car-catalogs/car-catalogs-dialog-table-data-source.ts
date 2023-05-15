import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { CarCatalog } from '../../../types/Car';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { AppDecimalPipe } from '../../formatters/app-decimal.pipe';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class CarCatalogsDialogTableDataSource extends DialogTableDataSource<CarCatalog> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private appUnitPipe: AppUnitPipe,
    private decimalPipe: AppDecimalPipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<CarCatalog>> {
    return new Observable((observer) => {
      const params = this.buildFilterValues();
      this.centralServerService
        .getCarCatalogs(params, this.getPaging(), this.getSorting())
        .subscribe({
          next: (CarCatalogs) => {
            observer.next(CarCatalogs);
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
        id: 'vehicleMake',
        name: 'cars.vehicle_make',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'vehicleModel',
        name: 'cars.vehicle_model',
        class: 'text-left col-25p',
      },
      {
        id: 'vehicleModelVersion',
        name: 'cars.vehicle_model_version',
        class: 'text-left col-40p',
        formatter: (modelVersion: string) => (modelVersion ? modelVersion : '-'),
      },
      {
        id: 'drivetrainPowerHP',
        name: 'cars.drivetrain_power_hp',
        class: 'text-left col-25p',
        sortable: true,
        formatter: (drivetrainPowerHP: number) =>
          drivetrainPowerHP
            ? `${this.decimalPipe.transform(drivetrainPowerHP)} ${this.translateService.instant(
              'cars.unit.drivetrain_power_hp_unit'
            )}`
            : '-',
      },
      {
        id: 'chargeStandardPower',
        name: 'cars.charge_standard_power',
        class: 'text-left col-25p',
        sortable: true,
        formatter: (chargeStandardPower: number) =>
          chargeStandardPower
            ? this.appUnitPipe.transform(chargeStandardPower, 'kW', 'kW', true, 1, 0, 0)
            : '-',
      },
      {
        id: 'rangeReal',
        name: 'cars.range_real',
        class: 'text-left col-25p',
        sortable: true,
        formatter: (rangeReal: number) =>
          rangeReal
            ? this.decimalPipe.transform(rangeReal) +
              ' ' +
              this.translateService.instant('cars.unit.kilometer')
            : '-',
      },
    ];
  }
}
