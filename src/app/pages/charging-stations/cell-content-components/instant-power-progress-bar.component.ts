import { Component, Input } from '@angular/core';
import { TableColumnDef, Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
    <div class="power-bar-text" [class.power-bar-text-error]="maxPowerW==0">{{instantPowerW | appUnit:'W':'kW':false:0:0}}
      <ng-container *ngIf="maxPowerW!==0"> / {{maxPowerW | appUnit:'W':'kW':true:2:0}}</ng-container></div>
    <mat-progress-bar [hidden]="maxPowerW===0"
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
