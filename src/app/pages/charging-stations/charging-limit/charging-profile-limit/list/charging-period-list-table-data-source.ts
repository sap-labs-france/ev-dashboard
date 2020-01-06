import { Injectable, QueryList, ViewChildren, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  TableColumnDef,
  TableDef,
  ChargingSchedulePeriod,
  ChargingProfileKindType
} from 'app/common.types';
import { SpinnerService } from 'app/services/spinner.service';
import { EditableTableDataSource } from '../../../../../shared/table/editable-table-data-source';
import { ChargingStationPowerSliderComponent } from '../../component/charging-station-power-slider.component';
import { Charger} from 'app/common.types';



@Injectable()
export class ChargingPeriodListTableDataSource extends EditableTableDataSource<ChargingSchedulePeriod> {
  @Input() charger!: Charger;
  @ViewChildren('powerSliders') powerSliders!: QueryList<ChargingStationPowerSliderComponent>;

  constructor(public spinnerService: SpinnerService) {
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
        id: 'chargingSchedulePeriod.startPeriod',
        name: 'Starting slot date',
        editType: 'datepicker',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
      },
      {
        id: 'chargingSchedule.chargingProfileId',
        name: 'Slot duration',
        headerClass: 'col-20p',
        class: 'col-20p',
      },
      {
        id: 'chargingSchedulePeriod.limit',
        name: 'Slot power limit',
        isAngularComponent: true,
        angularComponent: ChargingStationPowerSliderComponent,
        headerClass: 'col-20p',
        class: 'col-20p',
      },
    ];

    return tableColumnDef;
  }


  public addData() {
    const chargingSchedulePeriod = <ChargingSchedulePeriod> {};
    return chargingSchedulePeriod;
  }
}
