import { Component, Input, OnInit } from '@angular/core';
import { CellContentTemplateDirective } from 'app/shared/table/cell-content-template/cell-content-template.directive';
import { Schedule } from 'app/types/ChargingProfile';
import { ChargingStation } from 'app/types/ChargingStation';
import { Utils } from 'app/utils/Utils';

@Component({
  template: `
    <div class="row">
      <app-charging-station-power-slider class="col-md-12" [chargingStation]="chargingStation"
        [forChargingProfile]="true" [currentAmp]='row?.limit' (silderChanged)="sliderChanged($event)">
      </app-charging-station-power-slider>
    </div>
  `,
})
export class ChargingStationsChargingProfilePowerSliderCellComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: Schedule;
  @Input() public chargingStation!: ChargingStation;

  public ngOnInit() {
    this.chargingStation = this.columnDef.additionalParameters.chargingStation as ChargingStation;
  }

  public sliderChanged(value: number) {
    // Update the row
    this.row.limit = value;
    this.row.limitInkW = Math.floor(Utils.convertAmpToPowerWatts(this.chargingStation, value) / 1000);
    // Notify
    this.componentChanged.emit(value);
  }
}
