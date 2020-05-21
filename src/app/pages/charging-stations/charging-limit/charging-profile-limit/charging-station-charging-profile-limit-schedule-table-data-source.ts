import { TableColumnDef, TableDef, TableEditType } from 'app/types/Table';

import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import ChangeNotification from 'app/types/ChangeNotification';
import { ChargingStation } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Schedule } from 'app/types/ChargingProfile';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class ChargingStationChargingProfileLimitScheduleTableDataSource extends TableDataSource<Schedule> {
  public schedules!: Schedule[];
  public chargingStation!: ChargingStation;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private datePipe: AppDatePipe,
    private decimalPipe: AppDecimalPipe,
    private unitPipe: AppUnitPipe,
    private centralServerNotificationService: CentralServerNotificationService,
  ) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingProfiles();
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
        formatter: (value: number) => `${this.decimalPipe.transform(value)} ${this.translateService.instant('chargers.smart_charging.minutes')}`
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
        formatter: (value: number) => `${Utils.convertAmpToWattString(this.chargingStation, this.unitPipe, value, 'kW', true, 3)}
        ${this.translateService.instant('chargers.smart_charging.limit_in_amps', { limitInAmps: value} )}`
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
      // Ok
      observer.next(schedules);
      observer.complete();
    });
  }

  public setChargingProfileSchedule(schedules: Schedule[]) {
    this.schedules = schedules;
    this.refreshData(false).subscribe();
  }

  public setChargingStation(chargingStation: ChargingStation) {
    this.chargingStation = chargingStation;
  }
}
