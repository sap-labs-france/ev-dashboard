import {Component, ViewChild} from '@angular/core';
import {TableDef, Transaction} from '../../../common.types';
import {DetailComponent} from '../../../shared/table/detail-component/detail-component.component';
import { ConsumptionChartComponent } from 'app/shared/component/transactionChart/consumption-chart.component';

@Component({
  template: `
    <app-transaction-chart #consumptionChart *ngIf="transactionId" [transactionId]="transactionId" ratio="4"></app-transaction-chart>
  `
})

export class ConsumptionChartDetailComponent extends DetailComponent {
  transactionId: number;

  @ViewChild('consumptionChart') consumptionChartComponent: ConsumptionChartComponent;

  setData(row: Transaction, tabledef: TableDef) {
    this.transactionId = row.id;
  }

  getParentClass() {
    return 'col-md-12';
  }

  refresh(row) {
    if (this.consumptionChartComponent) {
      this.consumptionChartComponent.refresh();
    }
  }

}
