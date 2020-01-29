import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { Slot } from 'app/types/ChargingProfile';
import { ChargingStation } from 'app/types/ChargingStation';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Subject } from 'rxjs';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ChargingStationPowerSliderComponent } from '../component/charging-station-power-slider.component';

@Injectable()
export class ChargingSlotTableDataSource extends EditableTableDataSource<Slot> {

  public startDate!: Date;
  public rowChanged!: Subject<any>;

  constructor(
    public spinnerService: SpinnerService,
    private translateService: TranslateService,
    private datePipe: AppDatePipe,
    private messageService: MessageService ) {
    super(spinnerService);
    this.rowChanged = new Subject();
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

  public addCharger(charger: ChargingStation) {
    this.tableColumnDefs[3].additionalParameters = charger;
  }

  public createRow() {
    const chargingSchedulePeriod = {
      startDate: this.startDate,
      limitInkW: this.tableColumnDefs[3].additionalParameters.connectors[0].amperageLimit,
      connectorID: this.translateService.instant('chargers.smart_charging.connectors_all'),
      limit: 0,
      key: '',
      id: 0,
      duration: 60,
    } as Slot;

    for (const connector of this.tableColumnDefs[3].additionalParameters.connectors) {
      chargingSchedulePeriod.limit += connector.amperageLimit ? connector.amperageLimit : 0;
    }

    if (this.data[this.data.length - 1]) {
      var previousDate = new Date(this.data[this.data.length - 1].startDate);
      chargingSchedulePeriod.startDate = new Date(previousDate.setHours(previousDate.getHours() + 1));
      chargingSchedulePeriod.limitInkW = this.data[this.data.length - 1].limitInkW;
      this.data[this.data.length - 1].duration = 60;
    }
    this.rowChanged.next(this.data);
    return chargingSchedulePeriod;
  }

  public rowActionTriggered(actionDef: TableActionDef, row: Slot, dropdownItem?: DropdownItem){
    super.rowActionTriggered(actionDef, row, dropdownItem);
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (this.data[i - 1]) {
        let duration: number = 0;
        let date1 = new Date(this.data[i-1].startDate);
        let date2 = new Date(this.data[i].startDate);
        duration = (date2.getTime() - date1.getTime())/60/1000;
        this.data[i - 1].duration = duration;
      }
    }
    this.rowChanged.next(this.data);
  }

  public updateRowCell(cellValue: number, cellIndex: number, columnDef: TableColumnDef) {
    super.updateRowCell(cellValue, cellIndex, columnDef);
    let duration: number;
    if (this.data[cellIndex - 1]) {
      duration = Math.round((this.data[cellIndex].startDate.getTime() - this.data[cellIndex - 1].startDate.getTime()) / 1000 / 60);
      this.data[cellIndex - 1].duration = duration;
    } else if (cellIndex == 0) {
      duration = Math.round((this.data[cellIndex + 1].startDate.getTime() - this.data[cellIndex].startDate.getTime()) / 1000 / 60);
      this.data[cellIndex].duration = duration;
    }
    this.data[cellIndex].duration = cellValue;
    for (let i = cellIndex; i < this.data.length; i++) {
      if (this.data[i + 1]) {
        let date = new Date(this.data[i].startDate);
        date.setSeconds((date.getSeconds() + this.data[i].duration * 60));
        this.data[i + 1].startDate = date;
      }
    }
    this.rowChanged.next(this.data);
    console.log('upate1')
  }
}
