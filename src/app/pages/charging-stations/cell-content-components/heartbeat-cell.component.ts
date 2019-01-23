import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from '../../../services/locale.service';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
      <span class="charger-heartbeat">
      <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-ok" [class.charger-heartbeat-error]="row.inactive"></i>
      <span class="ml-1 charger-heartbeat-date charger-heartbeat-ok"
            [class.charger-heartbeat-date-error]="row.inactive">
        {{row.lastHeartBeat | appDate : locale : 'datetime'}}
      </span>
    </span>
  `
})
export class HeartbeatCellComponent extends CellContentTemplateComponent {
  //  row: any = {};
  locale: string;

  @Input() row: Charger;

  constructor(localeService: LocaleService) {
    super();
    this.locale = localeService.getCurrentFullLocaleForJS()
  }

}
