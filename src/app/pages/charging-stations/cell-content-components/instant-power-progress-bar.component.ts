import { Component, Input } from '@angular/core';
import { TableColumnDef, Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
    <div>{{instantPowerW | appKiloWatt}}/{{maxPowerW | appKiloWatt}}</div>
    <mat-progress-bar
      value="{{instantPowerW/maxPowerW*100}}"
      mode="determinate">
    </mat-progress-bar>
  `
})
export class InstantPowerProgressBarComponent implements CellContentTemplateComponent {
  instantPowerW: number = 0;
  maxPowerW: number = 0;
  /**
   * setData
   */
   setData(row: Charger, columndef: TableColumnDef) {
    row.connectors.forEach(connector => {
      this.maxPowerW += new Number(connector.power).valueOf();
      this.instantPowerW += new Number(connector.currentConsumption).valueOf();
    });
  }
}
