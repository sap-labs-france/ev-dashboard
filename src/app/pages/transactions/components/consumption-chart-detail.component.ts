import {Component} from '@angular/core';
import {TableDef, Transaction} from '../../../common.types';
import {DetailComponent} from '../../../shared/table/detail-component/detail-component.component';

@Component({
  template: `
    <app-transaction-chart *ngIf="transactionId" [transactionId]="transactionId" ratio="4"></app-transaction-chart>
  `
})

export class ConsumptionChartDetailComponent implements DetailComponent {
  transactionId: number;

  setData(row: Transaction, tabledef: TableDef) {
    this.transactionId = row.id;
  }

}
