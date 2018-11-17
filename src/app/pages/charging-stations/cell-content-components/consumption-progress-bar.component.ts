import { Component, Input } from '@angular/core';
import { TableColumnDef } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  styleUrls: ['../chargers-data-source-table.scss'],
  template: `
    <mat-progress-bar
      matTooltip="{{consumptionKw/1000}}/{{maxPower/1000}}"
      matTooltipPosition="below"
      value="{{consumptionPercent}}"
      mode="determinate">
    </mat-progress-bar>
  `
})
export class ConsumptionProgressBarComponent implements CellContentTemplateComponent {
  consumptionPercent: Number;
  consumptionKw: Number;
  maxPower: Number;
  progressbarClass: String;
  /**
   * setData
   */
   setData(row: any, columndef: TableColumnDef) {
    if (Array.isArray(row.connectors)) {
      let nbTotalKW = 0;
      let nbUsedKW = 0;
      row.connectors.forEach(connector => {
        nbTotalKW += connector.power;
        nbUsedKW += connector.currentConsumption;
      });
      this.consumptionKw = nbUsedKW;
      this.progressbarClass = (this.consumptionKw > 0 ? 'charger-connector-busy' : '');
      if (nbTotalKW > 0) {
        this.consumptionPercent = Math.floor(nbUsedKW / nbTotalKW * 100);
      }
      this.maxPower = nbTotalKW;
    }
  }
}
