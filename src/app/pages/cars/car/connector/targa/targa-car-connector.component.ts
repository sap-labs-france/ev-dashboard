import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CarsAuthorizations, DialogMode } from 'types/Authorization';
import { Car } from 'types/Car';

@Component({
  selector: 'app-targa-car-connector',
  templateUrl: 'targa-car-connector.component.html',
})
export class TargaCarConnectorComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public car: Car;
  @Input() public dialogMode: DialogMode;
  @Input() public carsAuthorizations: CarsAuthorizations;
  @Input() public carConnectorID: string;

  public initialized = false;

  public readonly DialogMode = DialogMode;
  public carConnectorMeterID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    this.formGroup.addControl(
      'carConnectorMeterID', new FormControl('', Validators.compose([
        Validators.required,
      ]))
    );
    this.carConnectorMeterID = this.formGroup.controls['carConnectorMeterID'];
    this.initialized = true;
    this.loadCarConnectorDetails();
  }

  public ngOnChanges() {
    this.loadCarConnectorDetails();
  }

  public loadCarConnectorDetails() {
    if (this.initialized && this.car) {
      this.carConnectorMeterID.setValue(this.car.carConnectorData?.carConnectorMeterID);
    }
  }

  public clearCarConnectorMeterID() {
    this.carConnectorMeterID.setValue(null);
    this.formGroup.markAsDirty();
  }
}
