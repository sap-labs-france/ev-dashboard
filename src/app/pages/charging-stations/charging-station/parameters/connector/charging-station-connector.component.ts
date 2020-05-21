import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargePoint, ChargingStation, Connector, CurrentType, Voltage } from 'app/types/ChargingStation';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CONNECTOR_TYPE_MAP } from 'app/shared/formatters/app-connector-type.pipe';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-connector',
  templateUrl: 'charging-station-connector.component.html',
})
export class ChargingStationConnectorComponent implements OnInit {
  @Input() public chargingStation!: ChargingStation;
  @Input() public connector!: Connector;
  @Input() public chargePoint!: ChargePoint;
  @Input() public formConnectorsArray: FormArray;
  @Input() public isAdmin!: boolean;
  @Output() public connectorChanged = new EventEmitter<any>();

  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
  ];

  public formConnectorGroup: FormGroup;
  public connectorID!: AbstractControl;
  public type!: AbstractControl;
  public power!: AbstractControl;
  public voltage!: AbstractControl;
  public amperage!: AbstractControl;
  public numberOfConnectedPhase!: AbstractControl;
  public currentType!: AbstractControl;

  public ngOnInit() {
    // Init connectors
    this.formConnectorGroup = new FormGroup({
      connectorId: new FormControl(this.connector.connectorId),
      type: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[^U]*$'),
        ])
      ),
      power: new FormControl(0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      voltage: new FormControl(Voltage.VOLTAGE_230,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      amperage: new FormControl(0,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      numberOfConnectedPhase: new FormControl(3,
        Validators.compose([
          Validators.required,
        ])
      ),
      currentType: new FormControl(CurrentType.AC),
    });
    // Add to form array
    this.formConnectorsArray.push(this.formConnectorGroup);
    // Form
    this.type = this.formConnectorGroup.controls['type'];
    this.power = this.formConnectorGroup.controls['power'];
    this.voltage = this.formConnectorGroup.controls['voltage'];
    this.amperage = this.formConnectorGroup.controls['amperage'];
    this.currentType = this.formConnectorGroup.controls['currentType'];
    this.numberOfConnectedPhase = this.formConnectorGroup.controls['numberOfConnectedPhase'];
    if (!this.isAdmin) {
      this.type.disable();
      this.voltage.disable();
      this.amperage.disable();
      this.numberOfConnectedPhase.disable();
    }
    this.power.disable();
    // Update connector values
    this.type.setValue(this.connector.type);
    this.power.setValue(this.connector.power);
    this.voltage.setValue(Utils.getChargingStationVoltage(this.chargingStation, this.connector.connectorId));
    this.amperage.setValue(this.connector.amperage);
    this.currentType.setValue(Utils.getChargingStationCurrentType(this.chargingStation, this.connector.connectorId));
    this.numberOfConnectedPhase.setValue(Utils.getChargingStationNumberOfConnectedPhases(this.chargingStation, this.connector.connectorId));
    if (this.chargePoint) {
      this.formConnectorsArray.disable();
    }
    this.refreshPower();
    this.refreshCurrentType();
  }

  public refreshPower() {
    if (this.amperage.value > 0 && this.voltage.value > 0) {
      this.power.setValue(Math.floor(this.amperage.value * this.voltage.value));
    } else {
      this.power.setValue(0);
    }
    this.connectorChanged.emit();
  }

  public numberOfConnectedPhaseChanged() {
    this.refreshCurrentType();
  }

  public refreshCurrentType() {
    // Change the current type
    if (this.numberOfConnectedPhase.value === 0) {
      this.currentType.setValue(CurrentType.DC);
    } else {
      this.currentType.setValue(CurrentType.AC);
    }
  }
}
