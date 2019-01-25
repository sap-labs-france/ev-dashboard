import { Component, ViewChild } from '@angular/core';
import { TableDef, Transaction } from '../../../common.types';
import { DetailComponent } from '../../../shared/table/detail-component/detail-component.component';
import { ConsumptionChartComponent } from 'app/shared/component/transactionChart/consumption-chart.component';

@Component({
  template: `
    <app-transaction-chart #chartConsumption *ngIf="transactionId" [transactionId]="transactionId" ratio="5.5"></app-transaction-chart>
  `
})

export class ConnectorConsumptionChartDetailComponent extends DetailComponent {
  transactionId: number;

  @ViewChild('chartConsumption') chartComponent: ConsumptionChartComponent;

  setData(row, tabledef: TableDef) {
    this.transactionId = row.activeTransactionID;
  }

  getParentClass() {
    return 'col-md-12';
  }

  refresh(row) {
    this.transactionId = row.activeTransactionID;
    this.chartComponent.refresh();
  }
}
