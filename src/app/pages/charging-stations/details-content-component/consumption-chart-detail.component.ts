import { Component, ViewChild } from '@angular/core';
import { TableDef, Transaction } from '../../../common.types';
import { CellContentComponentContainer } from '../../../shared/table/cell-content-template/cell-content-container.component';
import { ConsumptionChartComponent } from 'app/shared/component/transaction-chart/consumption-chart.component';

@Component({
  template: `
    <app-transaction-chart #chartConsumption *ngIf="transactionId" [transactionId]="transactionId" ratio="3"></app-transaction-chart>
  `
})

export class ConnectorConsumptionChartDetailComponent extends CellContentComponentContainer {
  // transactionId: number;

  // @ViewChild('chartConsumption') chartComponent: ConsumptionChartComponent;

  // setData(row, tabledef: TableDef) {
  //   this.transactionId = row.activeTransactionID;
  // }

  // getParentClass() {
  //   return 'col-md-12';
  // }

  // refresh(row) {
  //   this.transactionId = row.activeTransactionID;
  //   this.chartComponent.refresh();
  // }

  // destroy() {
  // }
}
