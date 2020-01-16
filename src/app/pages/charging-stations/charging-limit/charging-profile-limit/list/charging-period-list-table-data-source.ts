import { Injectable, QueryList, ViewChildren, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { TableColumnDef, TableDef } from 'app/types/Table';
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
  ;

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
        id: 'displayedStartValue',
        name: 'Starting slot date',
        editType: 'datetimepicker',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
      },
      {
        id: 'duration',
        name: 'Duration in min',
        headerClass: 'col-30p',
        editType: 'displayonly',
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
    this.tableColumnDefs[2].additionalParameters = charger;
  }

  public addData() {
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1)
    const chargingSchedulePeriod = <Slot>{

      displayedStartValue: currentDate,
      displayedLimitInkW: this.tableColumnDefs[2].additionalParameters.maximumPower / 1000,
      limit: 0,
      key: '',
      id: 0,
      duration: 0,
    };
    for (const connector of this.tableColumnDefs[2].additionalParameters.connectors) {
      chargingSchedulePeriod.limit += connector.amperage ? connector.amperage : 0;
    }
    if (this.data[this.data.length - 1]) {
      var previousDate = new Date(this.data[this.data.length - 1].displayedStartValue);
      chargingSchedulePeriod.displayedStartValue = new Date(previousDate.setHours(previousDate.getHours() + 1));
      chargingSchedulePeriod.displayedLimitInkW = this.data[this.data.length - 1].displayedLimitInkW;
      this.data[this.data.length-1].duration = 60;
    }
    return chargingSchedulePeriod;
  }

  public updateRow(value: any, index: number, columnDef: TableColumnDef) {
    // if (this.data[index - 1]) {
    //   if (value < this.data[index - 1].displayedStartValue || value > this.data[index - 1].displayedStartValue) {
    //     this.data[index].displayedStartValue = this.data[index-1].displayedStartValue
    //     this.messageService.showErrorMessage("Invalid Schedule");
    //     throw new Error('Invalid schedule');
    //   }
    // }
    // else if (index == 0) {
    //   if (value > this.data[index + 1].displayedStartValue) {
    //     this.data[index].displayedStartValue = this.data[index+1].displayedStartValue
    //     this.messageService.showErrorMessage("Invalid Schedule");
    //     throw new Error('Invalid schedule');
    //   }
    // }
    super.updateRow(value, index, columnDef);
    let duration: number;
    if (this.data[index - 1]) {
      duration = Math.round((this.data[index].displayedStartValue.getTime() - this.data[index - 1].displayedStartValue.getTime()) / 1000 / 60);
      this.data[index - 1].duration = duration;
    }
    else if (index == 0) {
      duration = Math.round((this.data[index + 1].displayedStartValue.getTime() - this.data[index].displayedStartValue.getTime()) / 1000 / 60);
      this.data[index].duration = duration;
    }

  }
}
