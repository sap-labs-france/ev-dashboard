import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { KeyValue } from '../../../../types/GlobalType';
import { CarConnectorConnectionSetting, CarConnectorConnectionType, CarConnectorMercedesConnectionType } from '../../../../types/Setting';
import { CarConnectorConnectionDialogComponent } from './car-connector-connection.dialog.component';

@Component({
  selector: 'app-settings-car-connector-connection',
  templateUrl: './car-connector-connection.component.html'
})
export class CarConnectorConnectionComponent implements OnInit {
  @Input() public currentCarConnectorConnection!: CarConnectorConnectionSetting;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<CarConnectorConnectionDialogComponent>;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;

  public mercedesConnection!: CarConnectorMercedesConnectionType;
  public carConnectorConnectionTypes: KeyValue[] = [
    { key: CarConnectorConnectionType.MERCEDES, value: 'settings.car_connector.types.mercedes' }
  ];
  public submitButtonTranslation!: any;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService) {}

  public ngOnInit(): void {
    // Init Form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      description: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      type: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    // Load current values if connection already exists
    this.loadCarConnectorConnection();
    // Get Create/Update button translation
    this.submitButtonTranslation = this.getSubmitButtonTranslation();
  }

  public loadCarConnectorConnection(): void {
    if (this.currentCarConnectorConnection) {
      this.formGroup.controls.id.setValue(this.currentCarConnectorConnection.id);
      if (this.currentCarConnectorConnection.name) {
        this.formGroup.controls.name.setValue(this.currentCarConnectorConnection.name);
      }
      if (this.currentCarConnectorConnection.description) {
        this.formGroup.controls.description.setValue(this.currentCarConnectorConnection.description);
      }
      if (this.currentCarConnectorConnection.type) {
        this.formGroup.controls.type.setValue(this.currentCarConnectorConnection.type);
        this.loadConnectionType();
      }
    }
  }

  public loadConnectionType(): void {
    switch (this.currentCarConnectorConnection.type) {
      case CarConnectorConnectionType.MERCEDES:
        this.mercedesConnection = this.currentCarConnectorConnection.mercedesConnection;
        break;
    }
  }

  public getSubmitButtonTranslation(): string {
    if (this.currentCarConnectorConnection && this.currentCarConnectorConnection.id) {
      return this.translateService.instant('general.update');
    }
    return this.translateService.instant('general.create');
  }

  public cancel(): void {
    if (this.inDialog) {
      this.dialogRef.close();
    }
  }

  public setConnectionAndClose(carConnectorConnection: CarConnectorConnectionSetting): void {
    if (this.inDialog) {
      // Generate the ID
      if (!carConnectorConnection.id) {
        carConnectorConnection.id = new Date().getTime().toString();
      }
      this.dialogRef.close(carConnectorConnection);
    }
  }

  public typeChanged(type: CarConnectorConnectionType) {
    if (this.formGroup.controls.mercedesConnection && type !== CarConnectorConnectionType.MERCEDES) {
      delete this.formGroup.controls.mercedesConnection;
    }
  }
}
