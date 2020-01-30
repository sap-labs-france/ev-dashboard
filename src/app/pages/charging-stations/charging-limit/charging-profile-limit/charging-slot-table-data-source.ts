import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { Slot } from 'app/types/ChargingProfile';
import { ChargingStation } from 'app/types/ChargingStation';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ChargingStationPowerSliderComponent } from '../component/charging-station-power-slider.component';

@Injectable()
export class ChargingSlotTableDataSource extends EditableTableDataSource<Slot> {
  public startDate!: Date;
  public charger!: ChargingStation;

  constructor(
    public spinnerService: SpinnerService,
    private translateService: TranslateService,
    private datePipe: AppDatePipe,
  ) {
    super(spinnerService);
  }

  public buildTableDef(): TableDef {
    return {
      isEditable: true,
      rowFieldNameIdentifier: 'id',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'connectorID',
        name: 'chargers.connector',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'col-10p',
        class: 'text-center col-10p',
      },
      {
        id: 'startDate',
        name: 'chargers.smart_charging.start_date',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'col-30p',
        class: 'text-center col-30p',
        formatter: (value: Date) => this.datePipe.transform(value, 'MMM d, y, h:mm a'),
      },
      {
        id: 'duration',
        name: 'chargers.smart_charging.duration',
        headerClass: 'col-15p',
        editType: TableEditType.INPUT,
        class: 'text-left col-15p',
      },
      {
        id: 'limitInkW',
        name: 'chargers.smart_charging.limit_title',
        isAngularComponent: true,
        angularComponent: ChargingStationPowerSliderComponent,
        headerClass: 'col-50p',
        class: 'col-45p',
      },
    ];
    return tableColumnDef;
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
    this.tableColumnDefs[3].additionalParameters = charger;
  }

  public recomputeChargingSlots() {
    const chargingSlots = this.getContent();
    if (chargingSlots.length > 0) {
      chargingSlots[0].startDate = this.startDate;
      // Recompute charging plan
      for (let i = 0; i < chargingSlots.length - 1; i++) {
        const date = new Date(chargingSlots[i].startDate);
        date.setSeconds((date.getSeconds() + chargingSlots[i].duration * 60));
        chargingSlots[i + 1].startDate = date;
      }
    }
  }

  public createRow() {
    const chargingSchedulePeriod = {
      startDate: this.startDate,
      limitInkW: this.charger.connectors[0].amperageLimit,
      connectorID: this.translateService.instant('chargers.smart_charging.connectors_all'),
      limit: 0,
      key: '',
      id: 0,
      duration: 60,
    } as Slot;
    // Build the limit
    for (const connector of this.charger.connectors) {
      chargingSchedulePeriod.limit += connector.amperageLimit ? connector.amperageLimit : 0;
    }
    // Init fields from
    if (this.data[this.data.length - 1]) {
      const previousDate = new Date(this.data[this.data.length - 1].startDate);
      chargingSchedulePeriod.startDate = new Date(previousDate.setHours(previousDate.getHours() + 1));
      chargingSchedulePeriod.limitInkW = this.data[this.data.length - 1].limitInkW;
      this.data[this.data.length - 1].duration = 60;
    }
    return chargingSchedulePeriod;
  }

  public rowActionTriggered(actionDef: TableActionDef, row: Slot, dropdownItem?: DropdownItem){
    super.rowActionTriggered(actionDef, row, dropdownItem);
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (this.data[i - 1]) {
        let duration = 0;
        const date1 = new Date(this.data[i - 1].startDate);
        const date2 = new Date(this.data[i].startDate);
        duration = (date2.getTime() - date1.getTime()) / 60 * 1000;
        this.data[i - 1].duration = duration;
      }
    }
  }

  public rowCellUpdated(cellValue: number, cellIndex: number, columnDef: TableColumnDef) {
    super.rowCellUpdated(cellValue, cellIndex, columnDef);
    this.recomputeChargingSlots();
    // let duration: number;
    // if (this.data[cellIndex - 1]) {
    //   duration = Math.round((this.data[cellIndex].startDate.getTime() - this.data[cellIndex - 1].startDate.getTime()) / 1000 / 60);
    //   this.data[cellIndex - 1].duration = duration;
    // } else if (cellIndex === 0) {
    //   duration = Math.round((this.data[cellIndex + 1].startDate.getTime() - this.data[cellIndex].startDate.getTime()) / 1000 / 60);
    //   this.data[cellIndex].duration = duration;
    // }
    // this.data[cellIndex].duration = cellValue;
    // for (let i = cellIndex; i < this.data.length; i++) {
    //   if (this.data[i + 1]) {
    //     const date = new Date(this.data[i].startDate);
    //     date.setSeconds((date.getSeconds() + this.data[i].duration * 60));
    //     this.data[i + 1].startDate = date;
    //   }
    // }
  }
}
