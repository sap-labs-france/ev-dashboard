import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { SiteArea } from '../../../../../types/SiteArea';
import { SiteAreaConsumptionChartComponent } from './site-area-consumption-chart.component';

@Component({
  template:
    `<app-site-area-chart #siteAreaConsumptionChart *ngIf="siteAreaId" [siteAreaId]="siteAreaId" ratio="3"></app-site-area-chart>`,
})

export class SiteAreaConsumptionChartDetailComponent extends CellContentTemplateDirective implements OnChanges, OnInit {
  @Input() public row!: SiteArea;
  @ViewChild('siteAreaConsumptionChart') public chartComponent!: SiteAreaConsumptionChartComponent;
  public siteAreaId!: string;

  public ngOnInit(): void {
    this.siteAreaId = this.row.id as string;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.siteAreaId = this.row.id as string;
    this.chartComponent.refresh();
  }
}
