import { Injectable } from '@angular/core';
import { MessageService } from 'app/services/message.service';
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

  constructor(public spinnerService: SpinnerService,
    private datePipe: AppDatePipe,
    private messageService: MessageService ) {
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
        editType: TableEditType.DISPLAY_ONLY_DATE,
        headerClass: 'col-30p',
        class: 'text-center col-30p',
        formatter: (value: Date) => this.datePipe.transform(value),
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

  public addCharger(charger: ChargingStation) {
    this.tableColumnDefs[3].additionalParameters = charger;
  }

  public addData() {
    const chargingSchedulePeriod = {
      startDate: this.startDate,
      limitInkW: this.tableColumnDefs[3].additionalParameters.maximumPower / 1000,
      connectorID: 'all',
      limit: 0,
      key: '',
      id: 0,
      duration: 60,
    } as Slot;

    for (const connector of this.tableColumnDefs[3].additionalParameters.connectors) {
      chargingSchedulePeriod.limit += connector.amperage ? connector.amperage : 0;
    }

    if (this.data[this.data.length - 1]) {
      let previousDate = new Date(this.data[this.data.length - 1].startDate);
      chargingSchedulePeriod.startDate = new Date(previousDate.setHours(previousDate.getHours() + 1));
      chargingSchedulePeriod.limitInkW = this.data[this.data.length - 1].limitInkW;
      this.data[this.data.length - 1].duration = 60;
    }
    return chargingSchedulePeriod;
  }

  public rowActionTriggered(actionDef: TableActionDef, row: Slot, dropdownItem?: DropdownItem) {
    super.rowActionTriggered(actionDef, row, dropdownItem);
    // for (let i = this.data.length - 1; i >= 0; i--) {
    //   if (this.data[i - 1]) {
    //     let duration: number = 0;
    //     let date1 = new Date(this.data[i-1].startDate);
    //     let date2 = new Date(this.data[i].startDate);
    //     duration = (date2.getTime() - date1.getTime())/60/1000;
    //     this.data[i - 1].duration = duration;
    //   }
    // }
  }

  public updateRow(value: Slot, index: number, columnDef: TableColumnDef) {
    super.updateRow(value, index, columnDef);
    // let duration: number;
    // if (this.data[index - 1]) {
    //   duration = Math.round((this.data[index].startDate.getTime() - this.data[index - 1].startDate.getTime()) / 1000 / 60);
    //   this.data[index - 1].duration = duration;
    // }
    // else if (index == 0) {
    //   duration = Math.round((this.data[index + 1].startDate.getTime() - this.data[index].startDate.getTime()) / 1000 / 60);
    //   this.data[index].duration = duration;
    // }
    // this.data[index].duration = value;
    // for (let i = index; i < this.data.length; i++) {
    //   if (this.data[i + 1]) {
    //     let date = new Date(this.data[i].startDate);
    //     date.setSeconds((date.getSeconds() + this.data[i].duration * 60));
    //     this.data[i + 1].startDate = date;
    //   }
    // }
  }
}
