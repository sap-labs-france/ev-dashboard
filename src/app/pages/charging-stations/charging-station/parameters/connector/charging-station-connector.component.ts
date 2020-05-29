import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ChargePoint, ChargingStation, Connector, CurrentType, Voltage } from 'app/types/ChargingStation';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { CONNECTOR_TYPE_MAP } from 'app/shared/formatters/app-connector-type.pipe';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-charging-station-connector',
  templateUrl: 'charging-station-connector.component.html',
})
export class ChargingStationConnectorComponent implements OnInit, OnChanges {
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
  public currentTypeMap = [
    { key: CurrentType.AC, description: 'chargers.alternating_current' },
    { key: CurrentType.DC, description: 'chargers.direct_current' },
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
          this.amperagePhaseValidator.bind(this),
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
    this.loadConnector();
  }

  public ngOnChanges() {
    this.loadConnector();
  }

  public loadConnector() {
    if (this.connector && this.formConnectorGroup) {
      const chargePoint = Utils.getChargePointFromID(this.chargingStation, this.connector.chargePointID);
      // Update connector values
      this.type.setValue(this.connector.type);
      this.power.setValue(
        Utils.getChargingStationPower(this.chargingStation, this.chargePoint, this.connector.connectorId));
      this.voltage.setValue(
        Utils.getChargingStationVoltage(this.chargingStation, this.chargePoint, this.connector.connectorId));
      this.amperage.setValue(
        Utils.getChargingStationAmperage(this.chargingStation, this.chargePoint, this.connector.connectorId));
      this.currentType.setValue(
        Utils.getChargingStationCurrentType(this.chargingStation, this.chargePoint, this.connector.connectorId));
      this.numberOfConnectedPhase.setValue(
        Utils.getNumberOfConnectedPhases(this.chargingStation, chargePoint, this.connector.connectorId));
      if (this.chargePoint) {
        this.formConnectorsArray.disable();
      } else {
        this.refreshPower();
        this.refreshNumberOfPhases();
      }
    }
  }

  public refreshPower() {
    if ((this.amperage.value as number) > 0 && (this.voltage.value as number) > 0) {
      this.power.setValue(
        Math.floor((this.amperage.value as number) * (this.voltage.value as number)));
    } else {
      this.power.setValue(0);
    }
    this.connectorChanged.emit();
  }

  public refreshNumberOfPhases() {
    if (this.currentType.value === CurrentType.DC) {
      this.numberOfConnectedPhase.setValue(3);
      this.numberOfConnectedPhase.disable();
    } else {
      this.numberOfConnectedPhase.enable();
    }
  }

  public currentTypeChanged() {
    this.refreshNumberOfPhases();
  }

  public amperageChanged() {
    this.refreshPower();
  }

  public voltageChanged() {
    this.refreshPower();
  }

  public numberOfConnectedPhaseChanged() {
    this.amperage.updateValueAndValidity();
  }

  private amperagePhaseValidator(amperageControl: AbstractControl): ValidationErrors|null {
    // Check
    if (!amperageControl.value ||
       (((amperageControl.value as number) % (this.numberOfConnectedPhase.value as number)) === 0)) {
      // Ok
      return null;
    }
    return { amperagePhases: true };
  }
}
