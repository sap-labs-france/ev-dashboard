import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { Schedule } from '../../../../types/ChargingProfile';
import { ChargePoint, ChargingStation } from '../../../../types/ChargingStation';
import { Utils } from '../../../../utils/Utils';

@Component({
  template: `
    <div class="row m-0">
      <app-charging-station-power-slider
        class="col-md-12"
        [chargingStation]="chargingStation"
        [chargePoint]="chargePoint"
        [forChargingProfile]="true"
        [currentAmp]="row?.limit"
        (sliderChangedEmitter)="sliderChanged($event)"
      >
      </app-charging-station-power-slider>
    </div>
  `,
})
export class ChargingStationPowerSliderCellComponent
  extends CellContentTemplateDirective
  implements OnInit, OnChanges {
  @Input() public row!: Schedule;
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargePoint!: ChargePoint;

  public ngOnInit() {
    this.chargingStation = this.columnDef.additionalParameters.chargingStation as ChargingStation;
    this.chargePoint = this.columnDef.additionalParameters.chargePoint as ChargePoint;
  }

  public ngOnChanges() {
    this.chargingStation = this.columnDef.additionalParameters.chargingStation as ChargingStation;
    this.chargePoint = this.columnDef.additionalParameters.chargePoint as ChargePoint;
  }

  public sliderChanged(value: number) {
    // Update the row
    this.row.limit = value;
    this.row.limitInkW = Math.floor(
      Utils.convertAmpToWatt(this.chargingStation, null, 0, value) / 1000
    );
    this.componentChanged.emit(value);
  }
}
