import { Injectable } from '@angular/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { Schedule } from 'app/types/ChargingProfile';
import { ChargingStation, ChargingStationPowers } from 'app/types/ChargingStation';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ChargingStationsChargingProfilePowerSliderCellComponent } from '../cell-components/charging-stations-charging-profile-power-slider-cell';

@Injectable()
export class ChargingStationChargingProfileLimitScheduleEditableTableDataSource extends EditableTableDataSource<Schedule> {
  public startDate!: Date;
  public endDate!: Date;
  public charger!: ChargingStation;
  private chargerPowers!: ChargingStationPowers;

  constructor(
    public spinnerService: SpinnerService,
    private datePipe: AppDatePipe,
  ) {
    super(spinnerService);
  }

  public buildTableDef(): TableDef {
    return {
      isEditable: true,
      rowFieldNameIdentifier: 'id',
      errorMessage: 'chargers.smart_charging.empty_schedule_list_error',
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
      },
      {
        id: 'limit',
        name: 'chargers.smart_charging.limit_title',
        isAngularComponent: true,
        angularComponent: ChargingStationsChargingProfilePowerSliderCellComponent,
        headerClass: 'col-50p',
        class: 'col-45p',
      },
    ];
    return tableColumnDef;
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
    this.tableColumnDefs[2].additionalParameters = { charger };
    this.chargerPowers = Utils.getChargingStationPowers(this.charger, undefined, true);
  }

  public refreshChargingSchedules() {
    const chargingSchedules = this.getContent();
    this.endDate = new Date(this.startDate);
    if (chargingSchedules.length > 0) {
      chargingSchedules[0].startDate = new Date(this.startDate);
      // Recompute charging plan date
      for (let i = 0; i < chargingSchedules.length; i++) {
        // Update the date of the next records
        if (i < chargingSchedules.length - 1) {
          chargingSchedules[i + 1].startDate = new Date(
            chargingSchedules[i].startDate.getTime() + Utils.convertToInteger(chargingSchedules[i].duration) * 60 * 1000);
        }
        // Update the limit in kW
        chargingSchedules[i].limitInkW = Math.floor(Utils.convertAmpToPowerWatts(this.charger, chargingSchedules[i].limit) / 1000);
        // Add
        this.endDate.setTime(this.endDate.getTime() + chargingSchedules[i].duration * 60 * 1000);
      }
    }
  }

  public createRow() {
    const chargingSchedulePeriod = {
      startDate: this.startDate,
      limitInkW: Math.floor(Utils.convertAmpToPowerWatts(this.charger, this.chargerPowers.maxAmp) / 1000),
      limit: this.chargerPowers.maxAmp,
      key: '',
      id: 0,
      duration: 60,
    } as Schedule;
    // Fix the start date
    const chargingSchedules = this.getContent();
    if (chargingSchedules.length > 0) {
      chargingSchedulePeriod.startDate =
        new Date(chargingSchedules[chargingSchedules.length - 1].startDate.getTime() + chargingSchedulePeriod.duration * 60 * 1000);
    }
    return chargingSchedulePeriod;
  }

  public rowActionTriggered(actionDef: TableActionDef, row: Schedule, dropdownItem?: DropdownItem) {
    // Call parent
    super.rowActionTriggered(actionDef, row, dropdownItem, this.refreshChargingSchedules.bind(this));
  }

  public rowCellUpdated(cellValue: number, cellIndex: number, columnDef: TableColumnDef) {
    // Call parent
    super.rowCellUpdated(cellValue, cellIndex, columnDef, this.refreshChargingSchedules.bind(this));
  }
}
