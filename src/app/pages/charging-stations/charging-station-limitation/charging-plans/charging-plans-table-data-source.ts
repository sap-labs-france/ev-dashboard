import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal.pipe';
import { AppUnitPipe } from '../../../../shared/formatters/app-unit.pipe';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { ChargingProfile, Schedule } from '../../../../types/ChargingProfile';
import { ChargePoint, ChargingStation } from '../../../../types/ChargingStation';
import { DataResult } from '../../../../types/DataResult';
import { TableColumnDef, TableDef, TableEditType } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';

@Injectable()
export class ChargingPlansTableDataSource extends TableDataSource<Schedule> {
  public schedules!: Schedule[];
  public chargingStation!: ChargingStation;
  public chargePoint!: ChargePoint;
  public chargingProfile!: ChargingProfile;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private datePipe: AppDatePipe,
    private decimalPipe: AppDecimalPipe,
    private unitPipe: AppUnitPipe
  ) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      rowFieldNameIdentifier: 'startDate',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'startDate',
        name: 'chargers.smart_charging.start_date',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'col-30p',
        class: 'text-center col-30p',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'duration',
        name: 'chargers.smart_charging.duration',
        headerClass: 'col-15p',
        editType: TableEditType.INPUT,
        class: 'text-center col-15p',
        formatter: (value: number) =>
          `${this.decimalPipe.transform(value)} ${this.translateService.instant(
            'chargers.smart_charging.minutes'
          )}`,
      },
      {
        id: 'endDate',
        name: 'chargers.smart_charging.end_date',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'col-30p',
        class: 'text-center col-30p',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'limit',
        name: 'chargers.smart_charging.limit_title',
        headerClass: 'col-50p',
        class: 'col-45p',
        formatter: (limit: number) => `${Utils.convertAmpToWattString(
          this.chargingStation,
          this.chargePoint,
          this.chargingProfile.connectorID,
          this.unitPipe,
          limit,
          'kW',
          true,
          3
        )}
        ${this.translateService.instant('chargers.smart_charging.limit_in_amps', {
    limitInAmps: limit,
  })}`,
      },
    ];
    return tableColumnDef;
  }

  public loadDataImpl(): Observable<DataResult<Schedule>> {
    return new Observable((observer) => {
      const schedules = {} as DataResult<Schedule>;
      if (this.schedules) {
        schedules.count = this.schedules.length;
        schedules.result = this.schedules;
      } else {
        schedules.count = 0;
        schedules.result = [];
      }
      observer.next(schedules);
      observer.complete();
    });
  }

  public setChargingProfileSchedule(schedules: Schedule[]) {
    this.schedules = schedules;
    this.refreshData(false).subscribe();
  }

  public setChargingProfile(chargingProfile: ChargingProfile) {
    this.chargingProfile = chargingProfile;
  }

  public setChargingStation(chargingStation: ChargingStation, chargePoint: ChargePoint) {
    this.chargingStation = chargingStation;
    this.chargePoint = chargePoint;
  }
}
