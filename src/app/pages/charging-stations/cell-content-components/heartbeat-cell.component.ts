import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from '../../../services/locale.service';
import * as moment from 'moment';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
      <span class="charger-heartbeat" appTooltip="" data-toggle="tooltip" [title]="tooltip">
      <!--[ngbTooltip]="row.lastHeartBeat | appDate : locale : 'datetime'" -->
      <!-- [title]="row.lastHeartBeat | appDate : locale : 'datetime'" -->
      <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-ok" [class.charger-heartbeat-error]="row.inactive"></i>
      <ng-container *ngIf="row.inactive">
        <span class="ml-1 charger-heartbeat-date charger-heartbeat-date-error">
          {{'chargers.charger_disconnected' | translate:disconnectedDuration }}
          <!--{{row.lastHeartBeat | appDate : locale : 'datetime'}}-->
        </span>
      </ng-container>
      <ng-container *ngIf="!row.inactive">
        <span class="ml-1 charger-heartbeat-date charger-heartbeat-ok">
          {{'chargers.charger_connected' | translate}}
<!--          {{row.lastHeartBeat | appDate : locale : 'time'}} -->
        </span>
      </ng-container>
    </span>
  `
})
export class HeartbeatCellComponent extends CellContentTemplateComponent implements OnInit {
  //  row: any = {};
  locale: string;

  @Input() row: Charger;
  disconnectedDuration: any;
  tooltip: string;

  constructor(localeService: LocaleService, 
          private appDate: AppDatePipe) {
    super();
    this.locale = localeService.getCurrentFullLocaleForJS()
  }

  ngOnInit(): void {
    this.setData();
  }

  getDisconnectedDuration() {
    moment.locale(this.locale);
    return {from: moment(this.row.lastHeartBeat).fromNow()};
  }

  refresh(): void {
    // console.log(`refresh heartbeat ${this.row.id} ${this.getDisconnectedDuration().from}`)
    // this.disconnectedDuration = this.getDisconnectedDuration();
    this.setData();
  }

  setData() {
    if (this.row.inactive) {
      this.disconnectedDuration = this.getDisconnectedDuration();
    }
    this.tooltip = this.appDate.transform(this.row.lastHeartBeat, this.locale, 'datetime');
  }

}
