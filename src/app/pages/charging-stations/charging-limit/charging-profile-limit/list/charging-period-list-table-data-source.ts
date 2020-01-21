import { Injectable, QueryList, ViewChildren, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Data, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { ChargingProfile, Slot } from 'app/types/ChargingProfile'
import { SpinnerService } from 'app/services/spinner.service';
import { EditableTableDataSource } from '../../../../../shared/table/editable-table-data-source';
import { ChargingStationPowerSliderComponent } from '../../component/charging-station-power-slider.component';
import { Charger } from 'app/common.types';
import { ChargingStation } from 'app/types/ChargingStation';
import { CurrencyPipe } from '@angular/common';
import { duration } from 'moment';
import { MessageService } from 'app/services/message.service';



@Injectable()
export class ChargingPeriodListTableDataSource extends EditableTableDataSource<Slot> {

  public startDate!: Date;

  constructor(public spinnerService: SpinnerService,
    private messageService: MessageService, ) {
    super(spinnerService)
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
        name: 'Connector',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'col-10p',
        class: 'text-center col-10p',
      },
      {
        id: 'displayedStartValue',
        name: 'Starting slot date',
        editType: TableEditType.DISPLAY_ONLY_DATE,
        headerClass: 'col-30p',
        class: 'text-center col-30p',
      },
      {
        id: 'duration',
        name: 'Duration in min',
        headerClass: 'col-30p',
        editType: TableEditType.INPUT,
        class: 'text-left col-30p',
      },
      {
        id: 'displayedLimitInkW',
        name: 'Slot power limit',
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
    const chargingSchedulePeriod = <Slot>{
      displayedStartValue: this.startDate,
      displayedLimitInkW: this.tableColumnDefs[3].additionalParameters.maximumPower / 1000,
      connectorID: 'all',
      limit: 0,
      key: '',
      id: 0,
      duration: 60,
    };
    for (const connector of this.tableColumnDefs[3].additionalParameters.connectors) {
      chargingSchedulePeriod.limit += connector.amperage ? connector.amperage : 0;
    }
    if (this.data[this.data.length - 1]) {
      var previousDate = new Date(this.data[this.data.length - 1].displayedStartValue);
      chargingSchedulePeriod.displayedStartValue = new Date(previousDate.setHours(previousDate.getHours() + 1));
      chargingSchedulePeriod.displayedLimitInkW = this.data[this.data.length - 1].displayedLimitInkW;
      this.data[this.data.length - 1].duration = 60;
    }
    return chargingSchedulePeriod;
  }

  public rowActionTriggered(actionDef: TableActionDef, row: any, dropdownItem?: DropdownItem){
    super.rowActionTriggered(actionDef, row, dropdownItem);
    for (let i = this.data.length-1; i >= 0; i--) {
      if (this.data[i - 1]) {
        let duration: number = 0;
        let date1 = new Date(this.data[i-1].displayedStartValue);
        let date2 = new Date(this.data[i].displayedStartValue);
        duration = (date2.getTime() - date1.getTime())/60/1000;
        this.data[i - 1].duration = duration;
      }
    }
  }


  public updateRow(value: any, index: number, columnDef: TableColumnDef) {
    super.updateRow(value, index, columnDef);
    // let duration: number;
    // if (this.data[index - 1]) {
    //   duration = Math.round((this.data[index].displayedStartValue.getTime() - this.data[index - 1].displayedStartValue.getTime()) / 1000 / 60);
    //   this.data[index - 1].duration = duration;
    // }
    // else if (index == 0) {
    //   duration = Math.round((this.data[index + 1].displayedStartValue.getTime() - this.data[index].displayedStartValue.getTime()) / 1000 / 60);
    //   this.data[index].duration = duration;
    // }
      this.data[index].duration = value

    for (let i = index; i < this.data.length; i++) {
      if (this.data[i + 1]) {
        let date = new Date(this.data[i].displayedStartValue)
        date.setSeconds((date.getSeconds() + this.data[i].duration * 60));
        this.data[i + 1].displayedStartValue = date;
      }
    }
  }
}
