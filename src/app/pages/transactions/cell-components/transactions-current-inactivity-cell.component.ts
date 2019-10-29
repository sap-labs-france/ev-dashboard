import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { PercentPipe } from '@angular/common';
import { LocaleService } from 'app/services/locale.service';

@Component({
  template: `
    <span>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'info'">
        <span class="ml-1 text-success">
          {{row.currentTotalInactivitySecs | appCurrentInactivity:row.timestamp}}
        </span>
      </ng-container>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'warning'">
        <span class="ml-1 text-warning">
          {{row.currentTotalInactivitySecs | appCurrentInactivity:row.timestamp}}
        </span>
      </ng-container>
      <ng-container *ngIf="row.currentInactivityStatusLevel && row.currentInactivityStatusLevel === 'danger'">
        <span class="ml-1 text-danger">
          {{row.currentTotalInactivitySecs | appCurrentInactivity:row.timestamp}}
        </span>
      </ng-container>
      <ng-container *ngIf="!row.currentInactivityStatusLevel || (row.currentInactivityStatusLevel !== 'info' && row.currentInactivityStatusLevel !== 'warning' && row.currentInactivityStatusLevel !== 'danger')">
        <span class="ml-1">
          {{row.currentTotalInactivitySecs | appCurrentInactivity:row.timestamp}}
        </span>
      </ng-container>
    </span>
  `,
})
export class TransactionsCurrentInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row: Transaction;
}


@Pipe({name: 'appCurrentInactivity'})
export class AppCurrentInactivityPipe implements PipeTransform {
  private readonly locale: string;
  private percentPipe: PercentPipe;
  private appDurationPipe: AppDurationPipe;

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentLocaleJS();
    this.percentPipe = new PercentPipe(this.locale);
    this.appDurationPipe = new AppDurationPipe(localeService);
  }

  transform(totalInactivitySecs: number, timestamp: Date): string {
    const totalDurationSecs = Math.round((new Date().getTime() - new Date(timestamp).getTime())/1000);
    const percentage = totalDurationSecs > 0 ? (totalInactivitySecs / totalDurationSecs) : 0;
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.percentPipe.transform(percentage, '1.0-0')})`;
  }
}

