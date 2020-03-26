import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Car, ChargeStandardTable } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { TableColumnDef, TableDef } from 'app/types/Table';
import { Observable } from 'rxjs';

@Injectable()
export class ChargeStandardTableDataSource extends TableDataSource<ChargeStandardTable> {
  public car!: Car;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
  ) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      isSimpleTable: true,
      hasDynamicRowAction: false,
    };
  }

  public setTable(car: Car) {
    this.car = car;
  }

  public loadDataImpl(): Observable<DataResult<ChargeStandardTable>> {
    return new Observable((observer) => {
      // Return charge standard table
      if (this.car) {
        observer.next({
          count: this.car.chargeStandardTables.length,
          result: this.car.chargeStandardTables,
        });
        observer.complete();
      }
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'type',
        name: 'cars.type',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'evsePhaseVolt',
        name: 'cars.evsePhaseVolt',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'evsePhaseAmp',
        name: 'cars.evsePhaseAmp',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'evsePhase',
        name: 'cars.evsePhase',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'chargePhaseVolt',
        name: 'cars.chargePhaseVolt',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'chargePower',
        name: 'cars.chargePower',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'chargeTime',
        name: 'cars.chargeTime',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
        formatter: (chargeTime: number) => chargeTime + ` ${this.translateService.instant('cars.unit.minutes')}`,
      },
      {
        id: 'chargeSpeed',
        name: 'cars.chargeSpeed',
        headerClass: 'col-20p',
        class: 'text-center col-20p',
      },
    ];
    return tableColumnDef;
  }

}
