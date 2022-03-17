import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { TableDef } from 'types/Table';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { SiteArea } from '../../../../../types/SiteArea';
import { SiteAreaConsumptionChartComponent } from './site-area-consumption-chart.component';

@Component({
  template:
    `<app-site-area-chart #siteAreaConsumptionChart *ngIf="siteAreaId" [siteAreaId]="siteAreaId" ratio="3" [canCrudSiteArea]="canCrudSiteArea"></app-site-area-chart>`,
})

export class SiteAreaConsumptionChartDetailComponent extends CellContentTemplateDirective implements OnChanges, OnInit {
  @Input() public row!: SiteArea;
  @Input() public tableDef!: TableDef;
  @ViewChild('siteAreaConsumptionChart') public chartComponent!: SiteAreaConsumptionChartComponent;
  public siteAreaId!: string;
  public canCrudSiteArea!: boolean;

  public ngOnInit(): void {
    this.siteAreaId = this.row.id as string;
    this.canCrudSiteArea = this.tableDef.rowDetails.additionalParameters.canCreate && this.row.canRead && this.row.canUpdate && this.row.canDelete;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.siteAreaId = this.row.id as string;
    this.canCrudSiteArea = this.tableDef.rowDetails.additionalParameters.canCreate && this.row.canRead && this.row.canUpdate && this.row.canDelete;
    this.chartComponent.refresh();
  }
}
