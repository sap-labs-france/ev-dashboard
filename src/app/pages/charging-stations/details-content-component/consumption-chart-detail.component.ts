import { Component, ViewChild, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { ConsumptionChartComponent } from 'app/shared/component/transaction-chart/consumption-chart.component';
import { Connector } from 'app/common.types';

@Component({
  template:
  `<app-transaction-chart #chartConsumption *ngIf="transactionId" [transactionId]="transactionId" ratio="3"></app-transaction-chart>`
})

export class ConnectorConsumptionChartDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row: Connector;
  @ViewChild('chartConsumption') chartComponent: ConsumptionChartComponent;
  public transactionId;

  ngOnInit(): void {
    console.log(this.row.activeTransactionID);
    // Set the transaction id
    this.transactionId = this.row.activeTransactionID;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set the transaction id
    this.transactionId = this.row.activeTransactionID;
    // Load data
    this.chartComponent.refresh();
  }
}
