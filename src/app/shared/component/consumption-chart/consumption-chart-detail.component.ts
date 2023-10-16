import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { ConsumptionChartComponent } from '../../../shared/component/consumption-chart/consumption-chart.component';
import { Connector } from '../../../types/ChargingStation';
import { Transaction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { CellContentTemplateDirective } from '../../table/cell-content-template/cell-content-template.directive';

@Component({
  template: `<app-transaction-chart
    #chartConsumption
    *ngIf="transactionId"
    [transactionId]="transactionId"
    [inDialog]="inDialog"
    ratio="3"
  ></app-transaction-chart>`,
})
export class ConsumptionChartDetailComponent
  extends CellContentTemplateDirective
  implements OnChanges, OnInit {
  @Input() public inDialog!: boolean;
  @Input() public row!: Connector | Transaction;
  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;
  public transactionId!: number;

  public ngOnInit(): void {
    // Set the transaction id
    if (Utils.objectHasProperty(this.row, 'currentTransactionID')) {
      // Connector
      this.transactionId = (this.row as Connector).currentTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id as number;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Set the transaction id
    if (Utils.objectHasProperty(this.row, 'currentTransactionID')) {
      // Connector
      this.transactionId = (this.row as Connector).currentTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id as number;
    }
    // Load data
    this.chartComponent.refresh();
  }
}
