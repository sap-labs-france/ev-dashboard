import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { SiteArea } from 'app/types/SiteArea';
import { SiteAreaConsumptionChartComponent } from './site-area-consumption-chart.component';

@Component({
  template:
    `<app-site-area-chart #siteAreaConsumptionChart *ngIf="siteAreaId" [siteAreaId]="siteAreaId" ratio="3"></app-site-area-chart>`,
})

export class SiteAreaConsumptionChartDetailComponent extends CellContentTemplateComponent implements OnChanges, OnInit {
  @Input() row!: SiteArea;
  @ViewChild('siteAreaConsumptionChart') chartComponent!: SiteAreaConsumptionChartComponent;
  public siteAreaId!: string;

  ngOnInit(): void {
      this.siteAreaId = this.row.id as string;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.siteAreaId = this.row.id as string;
    this.chartComponent.refresh();
  }
}
