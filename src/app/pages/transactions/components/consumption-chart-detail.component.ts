import {Component, ViewChild} from '@angular/core';
import {TableDef, Transaction} from '../../../common.types';
import { CellContentComponentContainer } from '../../../shared/table/cell-content-template/cell-content-container.component';
import { ConsumptionChartComponent } from 'app/shared/component/transaction-chart/consumption-chart.component';

@Component({
  template: `
    <app-transaction-chart #consumptionChart *ngIf="transactionId" [transactionId]="transactionId" ratio="4" class="w-100">
    </app-transaction-chart>
  `
})

export class ConsumptionChartDetailComponent extends CellContentComponentContainer {
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

  destroy() {
  }

}
