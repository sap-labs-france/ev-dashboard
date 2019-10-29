import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Connector } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { LocaleService } from 'app/services/locale.service';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';

@Component({
  template: `
  <span>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'info'">
    <span class="ml-1 text-success">
      {{row.totalInactivitySecs | appConnectorInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'warning'">
    <span class="ml-1 text-warning">
      {{row.totalInactivitySecs | appConnectorInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.inactivityStatusLevel && row.inactivityStatusLevel === 'danger'">
    <span class="ml-1 text-danger">
      {{row.totalInactivitySecs | appConnectorInactivity}}
    </span>
  </ng-container>
  <ng-container *ngIf="!row.inactivityStatusLevel || (row.inactivityStatusLevel !== 'info' && row.inactivityStatusLevel !== 'warning' && row.inactivityStatusLevel !== 'danger')">
    <span class="ml-1">
      {{row.totalInactivitySecs | appConnectorInactivity}}
    </span>
  </ng-container>
</span>
`,
})
export class ChargingStationsConnectorInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Connector;
}

@Pipe({name: 'appConnectorInactivity'})
export class AppConnectorInactivityPipe implements PipeTransform {
  private readonly locale: string;
  private appDurationPipe: AppDurationPipe;

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentLocaleJS();
    this.appDurationPipe = new AppDurationPipe(localeService);
  }

  transform(totalInactivitySecs: number): string {
    return this.appDurationPipe.transform(totalInactivitySecs);
  }
}
