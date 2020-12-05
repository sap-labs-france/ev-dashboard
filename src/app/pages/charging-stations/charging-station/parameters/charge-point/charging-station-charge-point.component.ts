import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { ChargePoint, ChargingStation, CurrentType, Voltage } from '../../../../../types/ChargingStation';

@Component({
  selector: 'app-charging-station-charge-point',
  templateUrl: 'charging-station-charge-point.component.html',
})
export class ChargingStationChargePointComponent implements OnInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;
  @Input() public chargePoint!: ChargePoint;
  @Input() public formChargePointsArray: FormArray;
  @Input() public formConnectorsArray: FormArray;
  @Input() public isAdmin!: boolean;
  @Output() public chargePointChanged = new EventEmitter<any>();

  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
    { key: 0, description: 'chargers.direct_current' },
  ];

  public formChargePointGroup: FormGroup;
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
    this.formChargePointGroup = new FormGroup({
      currentType: new FormControl(CurrentType.AC,
        Validators.compose([
        ])
      ),
      voltage: new FormControl(Voltage.VOLTAGE_230,
        Validators.compose([
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      amperage: new FormControl(0,
        Validators.compose([
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      numberOfConnectedPhase: new FormControl(3,
        Validators.compose([
          Validators.required,
        ])
      ),
      cannotChargeInParallel: new FormControl(false,
        Validators.compose([
        ])
      ),
      sharePowerToAllConnectors: new FormControl(false,
        Validators.compose([
        ])
      ),
      excludeFromPowerLimitation: new FormControl(false,
        Validators.compose([
        ])
      ),
      power: new FormControl(0,
        Validators.compose([
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      efficiency: new FormControl(0,
        Validators.compose([
          Validators.max(100),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      connectorIDs: new FormControl([]),
    });
    // Add to form array
    this.formChargePointsArray.push(this.formChargePointGroup);
    // Form
    this.currentType = this.formChargePointGroup.controls['currentType'];
    this.voltage = this.formChargePointGroup.controls['voltage'];
    this.amperage = this.formChargePointGroup.controls['amperage'];
    this.numberOfConnectedPhase = this.formChargePointGroup.controls['numberOfConnectedPhase'];
    this.cannotChargeInParallel = this.formChargePointGroup.controls['cannotChargeInParallel'];
    this.sharePowerToAllConnectors = this.formChargePointGroup.controls['sharePowerToAllConnectors'];
    this.excludeFromPowerLimitation = this.formChargePointGroup.controls['excludeFromPowerLimitation'];
    this.power = this.formChargePointGroup.controls['power'];
    this.efficiency = this.formChargePointGroup.controls['efficiency'];
    this.connectorIDs = this.formChargePointGroup.controls['connectorIDs'];
    this.formChargePointsArray.disable();
    this.loadChargePoint();
  }

  public ngOnChanges() {
    this.loadChargePoint();
  }

  public loadChargePoint() {
    if (this.chargePoint && this.formChargePointGroup) {
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
  }

  public numberOfConnectedPhaseChanged() {
    // Should not happen: Charge Point is read-only
    this.chargePointChanged.emit();
  }

  public connectorChanged() {
    // Should not happen: Charge Point is read-only
    this.chargePointChanged.emit();
  }
}
