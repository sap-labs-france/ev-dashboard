import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CONNECTOR_TYPE_MAP } from 'app/shared/formatters/app-connector-type.pipe';
import { Connector } from 'app/types/ChargingStation';

@Component({
  selector: 'app-charging-station-connector',
  templateUrl: 'charging-station-connector.component.html',
})
export class ChargingStationConnectorComponent implements OnInit {
  @Input() public connector!: Connector;
  @Input() public formConnectorsArray: FormArray;
  @Input() public isAdmin!: boolean;
  @Output() public connectorPowerChanged = new EventEmitter<any>();

  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = [
    { key: 1, description: 'chargers.single_phase' },
    { key: 3, description: 'chargers.tri_phases' },
    { key: 0, description: 'chargers.direct_current' },
  ];

  public formConnectorGroup: FormGroup;
  public connectorID!: AbstractControl;
  public type!: AbstractControl;
  public power!: AbstractControl;
  public voltage!: AbstractControl;
  public amperage!: AbstractControl;
  public numberOfConnectedPhase!: AbstractControl;

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
      power: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      voltage: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      amperage: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[+]?[0-9]*$'),
        ])
      ),
      numberOfConnectedPhase: new FormControl('',
        Validators.compose([
          Validators.required,
        ])
      ),
    });
    // Add to form array
    this.formConnectorsArray.push(this.formConnectorGroup);
    // Form
    this.type = this.formConnectorGroup.controls['type'];
    this.power = this.formConnectorGroup.controls['power'];
    this.voltage = this.formConnectorGroup.controls['voltage'];
    this.amperage = this.formConnectorGroup.controls['amperage'];
    this.numberOfConnectedPhase = this.formConnectorGroup.controls['numberOfConnectedPhase'];
    if (!this.isAdmin) {
      this.type.disable();
      this.voltage.disable();
      this.amperage.disable();
      this.numberOfConnectedPhase.disable();
    }
    this.power.disable();
    // Update connector values
    this.type.setValue(this.connector.type ? this.connector.type : 'U');
    this.power.setValue(this.connector.power);
    this.voltage.setValue(this.connector.voltage);
    this.amperage.setValue(this.connector.amperage);
    this.numberOfConnectedPhase.setValue(this.connector.numberOfConnectedPhase);
    // DC?
    if (this.connector.numberOfConnectedPhase === 0) {
      this.power.enable();
    } else {
      this.power.disable();
    }
    this.refreshPower();
  }

  public refreshPower() {
    if (this.amperage.value > 0 && this.voltage.value > 0) {
      this.power.setValue(Math.floor(this.amperage.value * this.voltage.value));
    } else {
      this.power.setValue(0);
    }
    // Notify
    this.connectorPowerChanged.emit();
  }
}
