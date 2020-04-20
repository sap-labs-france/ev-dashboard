import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { CarCatalog, ChargeStandardTable } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { TableColumnDef, TableDef } from 'app/types/Table';
import { Observable } from 'rxjs';

@Injectable()
export class CarCatalogConverterTableDataSource extends TableDataSource<ChargeStandardTable> {
  public carCatalog!: CarCatalog;
  constructor(
    public spinnerService: SpinnerService,
    private appDurationPipe: AppDurationPipe,
    private appUnitPipe: AppUnitPipe,
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

  public setCar(carCatalog: CarCatalog) {
    this.carCatalog = carCatalog;
    this.getManualDataChangeSubject().next();
  }

  public loadDataImpl(): Observable<DataResult<ChargeStandardTable>> {
    return new Observable((observer) => {
      // Return charge standard table
      if (this.carCatalog) {
        observer.next({
          count: this.carCatalog.chargeStandardTables.length,
          result: this.carCatalog.chargeStandardTables,
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
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
      },
      {
        id: 'evsePhaseVolt',
        name: 'cars.evse_phase_volt',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (evsePhaseVolt: number) => evsePhaseVolt ? `${evsePhaseVolt} V` : '-',
      },
      {
        id: 'evsePhaseAmp',
        name: 'cars.evse_phase_amp',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (evsePhaseAmp: number) => evsePhaseAmp ? `${evsePhaseAmp} A` : '-',
      },
      {
        id: 'evsePhase',
        name: 'cars.evse_phase',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (evsePhase: number) => evsePhase ? `${evsePhase}` : '-',
      },
      {
        id: 'chargePower',
        name: 'cars.charge_power',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (chargePower: number) => chargePower ? this.appUnitPipe.transform(chargePower, 'kW', 'kW', true, 1, 0) : '-',
      },
      {
        id: 'chargeTime',
        name: 'cars.charge_time',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (chargeTime: number) => chargeTime ? this.appDurationPipe.transform(chargeTime * 60) : '-',
      },
    ];
    return tableColumnDef;
  }
}
