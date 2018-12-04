import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
export class InstantPowerProgressBarComponent implements CellContentTemplateComponent, OnInit {

  @Input() row: Charger;

  instantPowerW: number = 0;
  maxPowerW: number = 0;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    let doNotConsiderConnectorPower = false;
    if (this.row.maximumPower > 0) {
      //max power is already assigned on charger level so take it
      this.maxPowerW = this.row.maximumPower;
      doNotConsiderConnectorPower = true;
    }
    for (const connector of this.row.connectors) {
      if (!doNotConsiderConnectorPower) {
        if (this.row.cannotChargeInParallel) {
          if (this.maxPowerW === 0) {
          // In case connectors can't charge in parallel we only take one connecteur value
            this.maxPowerW += new Number(connector.power).valueOf();
          }
        } else {
          this.maxPowerW += new Number(connector.power).valueOf();
        }
      }
      this.instantPowerW += new Number(connector.currentConsumption).valueOf();
    }
  }
  
}
