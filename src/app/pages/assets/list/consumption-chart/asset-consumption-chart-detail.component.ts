import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { Asset, AssetType } from '../../../../types/Asset';
import { AssetConsumptionChartComponent } from './asset-consumption-chart.component';

@Component({
  template: `<app-asset-chart
    #assetConsumptionChart
    *ngIf="assetID"
    [assetID]="assetID"
    [assetType]="assetType"
    ratio="3"
  ></app-asset-chart>`,
})
export class AssetConsumptionChartDetailComponent
  extends CellContentTemplateDirective
  implements OnChanges, OnInit {
  @Input() public row!: Asset;
  @ViewChild('assetConsumptionChart') public chartComponent!: AssetConsumptionChartComponent;
  public assetID!: string;
  public assetType!: AssetType;

  public ngOnInit(): void {
    this.assetID = this.row.id as string;
    this.assetType = this.row.assetType;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.assetID = this.row.id as string;
    this.assetType = this.row.assetType;
    this.chartComponent.refresh();
  }
}
