import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Charger} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {LocaleService} from '../../../services/locale.service';

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
export class HeartbeatCellComponent implements CellContentTemplateComponent, OnChanges {
//  row: any = {};
  locale: string;

  @Input() row: Charger;

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentFullLocaleForJS()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    // this.row.chargePointVendor;
  }

}
