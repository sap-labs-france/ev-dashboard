import { Injectable, QueryList, ViewChildren, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
      //   name: 'Slot duration',
      //   headerClass: 'col-20p',
      //   class: 'col-20p',
      // },
      {
        id: 'displayedLimitInkW',
        name: 'Slot power limit',
        editType: 'input',
        // isAngularComponent: true,
        // angularComponent: ChargingStationPowerSliderComponent,
        headerClass: 'col-20p',
        class: 'col-20p',
        //additionalParameters: this.charger,
      },
    ];
    return tableColumnDef;
  }

  public addData() {
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1)
    const chargingSchedulePeriod = <Slot> {
      displayedStartValue: currentDate,
      displayedLimitInkW: 0,
    };
    if(this.data[this.data.length-1]){
      chargingSchedulePeriod.displayedStartValue = new Date(this.data[this.data.length-1].displayedStartValue.setHours(this.data[this.data.length-1].displayedStartValue.getHours()+1));
      chargingSchedulePeriod.displayedLimitInkW = this.data[this.data.length-1].displayedLimitInkW;
    }
    return chargingSchedulePeriod;
  }
}
