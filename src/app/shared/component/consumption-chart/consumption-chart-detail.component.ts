import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConsumptionChartComponent } from 'app/shared/component/consumption-chart/consumption-chart.component';
import { Connector } from 'app/types/ChargingStation';
import { Transaction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
import { CellContentTemplateComponent } from '../../table/cell-content-template/cell-content-template.component';

@Component({
  template:
  `<app-transaction-chart #chartConsumption *ngIf="transactionId" [transactionId]="transactionId" ratio="3"></app-transaction-chart>`,
})

export class ConsumptionChartDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() public row!: Connector|Transaction;
  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;
  public transactionId!: number;

  public ngOnInit(): void {
    // Set the transaction id
    if (Utils.objectHasProperty(this.row, 'activeTransactionID')) {
      // Connector
      this.transactionId = (this.row as Connector).activeTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id as number;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Set the transaction id
    if (Utils.objectHasProperty(this.row, 'activeTransactionID')) {
      // Connector
      this.transactionId = (this.row as Connector).activeTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id as number;
    }
    // Load data
    this.chartComponent.refresh();
  }
}
