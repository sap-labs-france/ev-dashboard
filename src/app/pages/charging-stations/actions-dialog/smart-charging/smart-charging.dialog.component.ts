import {Component, Inject, ViewChild, AfterViewInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Charger } from "../../../../common.types";
import { SmartChargingSimpleLimitComponent } from './simple-limit/smart-charging-simple-limit.component';
import { SmartChargingLimitPlanningComponent } from './limit-planning/smart-charging-limit-planning.component';
import { SmartChargingLimitPlannerComponent } from './limit-planner/smart-charging-limit-planner.component';

@Component({
  selector: 'app-smart-charging-dialog-cmp',
  templateUrl: 'smart-charging.dialog.component.html'
})
export class ChargingStationSmartChargingDialogComponent implements AfterViewInit {
   charger: Charger;

  @ViewChild('simpleLimit') simpleLimitComponent: SmartChargingSimpleLimitComponent;
  @ViewChild('limitPlanning') limitPlanning: SmartChargingLimitPlanningComponent;
  @ViewChild('limitPlanner') limitPlanner: SmartChargingLimitPlannerComponent;
  constructor(
    private dialogRef: MatDialogRef<ChargingStationSmartChargingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.charger = data;
    }
  }

  ngAfterViewInit(): void {
    this.simpleLimitComponent.limitChanged(this.limitPlanning.internalFormatCurrentLimit);
  }

  limitChange(newValue) {
    if (this.simpleLimitComponent)
      this.simpleLimitComponent.limitChanged(newValue);
  }

  planningChanged(event) {
    if (this.limitPlanning) {
      this.limitPlanning.refresh();
    }
  }
}
