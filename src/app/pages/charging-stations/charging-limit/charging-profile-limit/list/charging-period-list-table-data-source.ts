import { Injectable, QueryList, ViewChildren, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { TableColumnDef, TableDef } from 'app/types/Table';
import {
  Slot,
} from 'app/common.types';
import { ChargingProfile } from 'app/types/ChargingProfile'
import { SpinnerService } from 'app/services/spinner.service';
import { EditableTableDataSource } from '../../../../../shared/table/editable-table-data-source';
import { ChargingStationPowerSliderComponent } from '../../component/charging-station-power-slider.component';
import { Charger} from 'app/common.types';
import { ChargingStation } from 'app/types/ChargingStation';
import { CurrencyPipe } from '@angular/common';



@Injectable()
export class ChargingPeriodListTableDataSource extends EditableTableDataSource<any> {;

  constructor(public spinnerService: SpinnerService) {
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
      // {
      //   id: 'duration',
      //   name: 'Duration in min',
      //   headerClass: 'col-30p',
      //   class: 'text-left col-30p',
      // },
      {
        id: 'displayedLimitInkW',
        name: 'Slot power limit',
        editType: 'input',
        isAngularComponent: true,
        angularComponent: ChargingStationPowerSliderComponent,
        headerClass: 'col-20p',
        class: 'col-20p',
      },
    ];
    return tableColumnDef;
  }

  public addCharger(charger: ChargingStation){
    this.tableColumnDefs[1].additionalParameters = charger;
  }

  public addData() {
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1)
    const chargingSchedulePeriod = <Slot> {
      displayedStartValue: currentDate,
      displayedLimitInkW: this.tableColumnDefs[2].additionalParameters.maximumPower/1000,
    };
    if(this.data[this.data.length-1]){
      var previousDate = new Date(this.data[this.data.length-1].displayedStartValue);
      chargingSchedulePeriod.displayedStartValue = new Date(previousDate.setHours(previousDate.getHours()+1));
      chargingSchedulePeriod.displayedLimitInkW = this.data[this.data.length-1].displayedLimitInkW;
    }
    return chargingSchedulePeriod;
  }

  // public updateRow(value: any, index: number, columnDef: TableColumnDef) {
  //   console.log("update");
  //   this.refreshData();
  //   if (columnDef.editType === 'datetimepicker'){
  //     if (this.data[index+1]){
  //       this.data[index].duration = this.data[index+1].getTime() - this.data[index].startPeriod.getTime();
  //     }
  //   }
  //   if (this.formArray) {
  //     const rowGroup: FormGroup = this.formArray.at(index) as FormGroup;
  //     // @ts-ignore
  //     rowGroup.get(columnDef.id).setValue(value);
  //     // @ts-ignore
  //     this.editableContent[index][columnDef.id] = value;
  //     this.formArray.markAsDirty();
  //   }
  // }
}
