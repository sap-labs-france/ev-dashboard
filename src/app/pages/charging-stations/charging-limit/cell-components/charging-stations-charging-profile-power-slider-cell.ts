import { Component, Input, OnInit } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Schedule } from 'app/types/ChargingProfile';
import { ChargingStation } from 'app/types/ChargingStation';
import { Utils } from 'app/utils/Utils';

@Component({
  template: `
    <div class="row">
      <app-charging-station-power-slider class="col-md-12" [charger]="charger"
        [forChargingProfile]="true" [currentAmp]='row?.limit' (silderChanged)="sliderChanged($event)">
      </app-charging-station-power-slider>
    </div>
  `,
})
export class ChargingStationsChargingProfilePowerSliderCellComponent extends CellContentTemplateComponent implements OnInit {
  @Input() public row!: Schedule;
  @Input() public charger!: ChargingStation;

  public ngOnInit() {
    this.charger = this.columnDef.additionalParameters.charger as ChargingStation;
  }

  public sliderChanged(value: number) {
    // Update the row
    this.row.limit = value;
    this.row.limitInkW = Math.floor(Utils.convertAmpToPowerWatts(this.charger, value) / 1000);
    // Notify
    this.componentChanged.emit(value);
  }
}
