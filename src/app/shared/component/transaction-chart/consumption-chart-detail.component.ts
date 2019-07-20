import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConsumptionChartComponent } from 'app/shared/component/transaction-chart/consumption-chart.component';
import { CellContentTemplateComponent } from '../../table/cell-content-template/cell-content-template.component';

@Component({
  template:
  `<app-transaction-chart #chartConsumption *ngIf="transactionId" [transactionId]="transactionId" ratio="3"></app-transaction-chart>`
})

export class ConsumptionChartDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: any;
  @ViewChild('chartConsumption', { static: false }) chartComponent: ConsumptionChartComponent;
  public transactionId;

  ngOnInit(): void {
    // Set the transaction id
    if (this.row.hasOwnProperty('activeTransactionID')) {
      // Connector
      this.transactionId = this.row.activeTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set the transaction id
    if (this.row.hasOwnProperty('activeTransactionID')) {
      // Connector
      this.transactionId = this.row.activeTransactionID;
    } else {
      // Transaction
      this.transactionId = this.row.id;
    }
    // Load data
    this.chartComponent.refresh();
  }
}
