import { ChargeStandardTable, Car } from 'app/types/Car';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDef, TableColumnDef } from 'app/types/Table';
import { Observable } from 'rxjs';
import { DataResult } from 'app/types/DataResult';

@Injectable()
export class ChargeStandardTableDataSource extends TableDataSource<ChargeStandardTable> {
  public car!: Car;
  public evsePhaseVolt!: number;
  public evsePhaseAmp!: number;
  public evsePhase!: number;
  public chargePhaseVolt!: number;
  public chargePhase!: number;
  public chargePower!: number;
  public chargeTime!: number;
  public chargeSpeed!: number;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
  ) {
    super(spinnerService, translateService);
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
    };
  }

  public setTable(car: Car) {
    debugger;
    this.car = car;
  }

  public loadDataImpl(): Observable<DataResult<ChargeStandardTable>> {
    debugger;
    return new Observable((observer) => {
      // Return connector
      debugger;
      if (this.car) {
        observer.next({
          count: 1,
          result: this.car.chargeStandardTables,
        });
        observer.complete();
      }
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
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
