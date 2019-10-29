import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { PercentPipe } from '@angular/common';
import { LocaleService } from '../../../services/locale.service';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';

@Component({
  template: `
  <span>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'info'">
    <span class="ml-1 text-success">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'warning'">
    <span class="ml-1 text-warning">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="row.stop.inactivityStatusLevel && row.stop.inactivityStatusLevel === 'danger'">
    <span class="ml-1 text-danger">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
  <ng-container *ngIf="!row.stop.inactivityStatusLevel || (row.stop.inactivityStatusLevel !== 'info' && row.stop.inactivityStatusLevel !== 'warning' && row.stop.inactivityStatusLevel !== 'danger')">
    <span class="ml-1">
      {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
    </span>
  </ng-container>
</span>
`,
})
export class TransactionsInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Transaction;
}

@Pipe({name: 'appInactivity'})
export class AppInactivityPipe implements PipeTransform {
  private readonly locale: string;
  private percentPipe: PercentPipe;
  private appDurationPipe: AppDurationPipe;

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentLocaleJS();
    this.percentPipe = new PercentPipe(this.locale);
    this.appDurationPipe = new AppDurationPipe(localeService);
  }

  transform(totalInactivitySecs: number, totalDurationSecs: number): string {
    const percentage = totalDurationSecs > 0 ? (totalInactivitySecs / totalDurationSecs) : 0;
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.percentPipe.transform(percentage, '1.0-0')})`;
  }
}
