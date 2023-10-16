import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import {
  ChargePoint,
  ChargingStation,
  CurrentType,
  Voltage,
} from '../../../../../types/ChargingStation';

@Component({
  selector: 'app-charging-station-charge-point',
  templateUrl: 'charging-station-charge-point.component.html',
})
export class ChargingStationChargePointComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargePoint!: ChargePoint;
  @Input() public formChargePointsArray: UntypedFormArray;
  @Input() public formConnectorsArray: UntypedFormArray;
  @Input() public isPublic!: boolean;
  @Input() public readOnly: boolean;
  @Input() public manualConfiguration!: boolean;
  @Output() public chargePointChanged = new EventEmitter<any>();

  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
    { key: 0, description: 'chargers.direct_current' },
  ];
  public initialized = false;

  public formChargePointGroup: UntypedFormGroup;
  public currentType!: AbstractControl;
  public voltage!: AbstractControl;
  public amperage!: AbstractControl;
  public numberOfConnectedPhase!: AbstractControl;
  public cannotChargeInParallel!: AbstractControl;
  public sharePowerToAllConnectors!: AbstractControl;
  public excludeFromPowerLimitation!: AbstractControl;
  public power!: AbstractControl;
  public efficiency!: AbstractControl;
  public connectorIDs!: AbstractControl;

  public ngOnInit() {
    // Init charge point
    this.formChargePointGroup = new UntypedFormGroup({
      chargePointID: new UntypedFormControl(this.chargePoint.chargePointID),
      ocppParamForPowerLimitation: new UntypedFormControl(
        this.chargePoint.ocppParamForPowerLimitation
      ),
      currentType: new UntypedFormControl(CurrentType.AC, Validators.compose([])),
      voltage: new UntypedFormControl(
        Voltage.VOLTAGE_230,
        Validators.compose([Validators.min(1), Validators.pattern('^[+]?[0-9]*$')])
      ),
      amperage: new UntypedFormControl(
        0,
        Validators.compose([Validators.min(1), Validators.pattern('^[+]?[0-9]*$')])
      ),
      numberOfConnectedPhase: new UntypedFormControl(3, Validators.compose([Validators.required])),
      cannotChargeInParallel: new UntypedFormControl(false, Validators.compose([])),
      sharePowerToAllConnectors: new UntypedFormControl(false, Validators.compose([])),
      excludeFromPowerLimitation: new UntypedFormControl(false, Validators.compose([])),
      power: new UntypedFormControl(
        0,
        Validators.compose([Validators.min(1), Validators.pattern('^[+]?[0-9]*$')])
      ),
      efficiency: new UntypedFormControl(
        0,
        Validators.compose([Validators.max(100), Validators.pattern('^[+]?[0-9]*$')])
      ),
      connectorIDs: new UntypedFormControl([]),
    });
    // Add to form array
    this.formChargePointsArray.push(this.formChargePointGroup);
    // Form
    this.currentType = this.formChargePointGroup.controls['currentType'];
    this.voltage = this.formChargePointGroup.controls['voltage'];
    this.amperage = this.formChargePointGroup.controls['amperage'];
    this.numberOfConnectedPhase = this.formChargePointGroup.controls['numberOfConnectedPhase'];
    this.cannotChargeInParallel = this.formChargePointGroup.controls['cannotChargeInParallel'];
    this.sharePowerToAllConnectors =
      this.formChargePointGroup.controls['sharePowerToAllConnectors'];
    this.excludeFromPowerLimitation =
      this.formChargePointGroup.controls['excludeFromPowerLimitation'];
    this.power = this.formChargePointGroup.controls['power'];
    this.efficiency = this.formChargePointGroup.controls['efficiency'];
    this.connectorIDs = this.formChargePointGroup.controls['connectorIDs'];
    this.initialized = true;
    this.loadChargePoint();
  }

  public ngOnChanges() {
    this.loadChargePoint();
  }

  public loadChargePoint() {
    if (this.initialized && this.chargePoint && this.formChargePointGroup) {
      // Set data
      this.currentType.setValue(this.chargePoint.currentType);
      this.voltage.setValue(this.chargePoint.voltage);
      this.amperage.setValue(this.chargePoint.amperage);
      this.numberOfConnectedPhase.setValue(this.chargePoint.numberOfConnectedPhase);
      this.cannotChargeInParallel.setValue(this.chargePoint.cannotChargeInParallel);
      this.sharePowerToAllConnectors.setValue(this.chargePoint.sharePowerToAllConnectors);
      this.excludeFromPowerLimitation.setValue(this.chargePoint.excludeFromPowerLimitation);
      this.power.setValue(this.chargePoint.power);
      this.efficiency.setValue(this.chargePoint.efficiency);
      this.connectorIDs.setValue(this.chargePoint.connectorIDs);
    }
    if (this.manualConfiguration) {
      this.formChargePointsArray.enable();
    } else {
      this.formChargePointsArray.disable();
    }
  }

  public numberOfConnectedPhaseChanged() {
    // Should not happen: Charge Point is read-only
    this.chargePointChanged.emit();
  }

  public connectorChanged() {
    // Should not happen: Charge Point is read-only
    this.chargePointChanged.emit();
  }

  public adjustMaximumPower() {
    this.chargePointChanged.emit();
  }
}
