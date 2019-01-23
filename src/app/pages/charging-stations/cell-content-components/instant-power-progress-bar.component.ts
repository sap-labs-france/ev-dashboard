import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TableColumnDef, Charger, Connector } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
    <div class="power-bar-text" [class.power-bar-text-error]="maxPowerW==0">
      <ng-container *ngIf="instantPowerW === 0 || instantPowerW >= 10; else elseTemplate">
        {{instantPowerW | appUnit:'W':'kW':false:0:0}}
      </ng-container>
      <ng-template #elseTemplate>
        {{instantPowerW | appUnit:'W':'kW':false:0:2}}
      </ng-template>
      <ng-container *ngIf="maxPowerW!==0"> / {{maxPowerW | appUnit:'W':'kW':true:2:0}}</ng-container>
    </div>
    <mat-progress-bar [hidden]="maxPowerW===0"
      value="{{instantPowerW/maxPowerW*100}}"
      mode="determinate">
    </mat-progress-bar>
  `
})


export class InstantPowerProgressBarComponent implements CellContentTemplateComponent, OnInit {

  @Input() row: any;

  instantPowerW = 0;
  maxPowerW = 0;

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    if (Array.isArray(<Charger>this.row.connectors)) {
      const charger = <Charger>this.row;
      // Extract the row information from a Charger
      let doNotConsiderConnectorPower = false;
      if (charger.maximumPower > 0) {
        // Max power is already assigned on charger level so take it
        this.maxPowerW = charger.maximumPower;
        doNotConsiderConnectorPower = true;
      }
      for (const connector of charger.connectors) {
        if (!doNotConsiderConnectorPower) {
          if (charger.cannotChargeInParallel) {
            if (this.maxPowerW === 0) {
              // In case connectors can't charge in parallel we only take one connecteur value
              this.maxPowerW += Number(connector.power).valueOf();
            }
          } else {
            this.maxPowerW += Number(connector.power).valueOf();
          }
        }
        this.instantPowerW += Number(connector.currentConsumption).valueOf();
      }
    } else if (<Connector>this.row) {
      // Extract the information from a connector
      const connector = <Connector>this.row;
      this.maxPowerW = connector.power;
      this.instantPowerW = connector.currentConsumption;
    }
  }
}
