import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SiteAreasAuthorizations } from 'types/Authorization';
import { TableDef } from 'types/Table';

import { CellContentTemplateDirective } from '../../../../../shared/table/cell-content-template/cell-content-template.directive';
import { SiteArea } from '../../../../../types/SiteArea';
import { SiteAreaConsumptionChartComponent } from './site-area-consumption-chart.component';

@Component({
  template: `<app-site-area-chart
    #siteAreaConsumptionChart
    *ngIf="siteArea.id"
    [siteArea]="siteArea"
    ratio="3"
    [siteAreasAuthorizations]="siteAreasAuthorizations"
  >
  </app-site-area-chart>`,
})
export class SiteAreaConsumptionChartDetailComponent
  extends CellContentTemplateDirective
  implements OnChanges, OnInit {
  @Input() public row!: SiteArea;
  @Input() public tableDef!: TableDef;
  @ViewChild('siteAreaConsumptionChart') public chartComponent!: SiteAreaConsumptionChartComponent;
  public siteArea!: SiteArea;
  public siteAreasAuthorizations!: SiteAreasAuthorizations;

  public ngOnInit(): void {
    this.siteArea = this.row;
    this.siteAreasAuthorizations = this.tableDef.rowDetails.additionalParameters;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.siteArea = this.row;
    this.siteAreasAuthorizations = this.tableDef.rowDetails.additionalParameters;
    this.chartComponent.refresh();
  }
}
