import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogMode } from 'types/Authorization';
import { Utils } from 'utils/Utils';

import { KeyValue } from '../../../../types/GlobalType';
import {
  CarConnectorConnectionSetting,
  CarConnectorConnectionType,
  CarConnectorMercedesConnectionType,
  CarConnectorTargaTelematicsConnectionType,
  CarConnectorTronityConnectionType,
} from '../../../../types/Setting';
import { CarConnectorConnectionDialogComponent } from './car-connector-connection.dialog.component';

@Component({
  selector: 'app-settings-car-connector-connection',
  templateUrl: 'car-connector-connection.component.html',
  styleUrls: ['car-connector-connection.component.scss'],
})
export class CarConnectorConnectionComponent implements OnInit {
  @Input() public currentCarConnectorConnection!: CarConnectorConnectionSetting;
  @Input() public dialogRef!: MatDialogRef<CarConnectorConnectionDialogComponent>;
  @Input() public dialogMode!: DialogMode;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;

  public mercedesConnection!: CarConnectorMercedesConnectionType;
  public tronityConnection!: CarConnectorTronityConnectionType;
  public targaTelematicsConnection!: CarConnectorTargaTelematicsConnectionType;
  public carConnectorConnectionTypes: KeyValue[] = [
    { key: CarConnectorConnectionType.MERCEDES, value: 'settings.car_connector.types.mercedes' },
    { key: CarConnectorConnectionType.TRONITY, value: 'settings.car_connector.types.tronity' },
    {
      key: CarConnectorConnectionType.TARGA_TELEMATICS,
      value: 'settings.car_connector.types.targa_telematics',
    },
  ];
  public submitButtonTranslation!: any;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private translateService: TranslateService) {}

  public ngOnInit(): void {
    // Init Form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      description: new FormControl('', Validators.compose([Validators.required])),
      type: new FormControl<CarConnectorConnectionType>(
        CarConnectorConnectionType.NONE,
        Validators.compose([Validators.required])
      ),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    // Load current values if connection already exists
    this.loadCarConnectorConnection();
    // Create / Update button translation
    this.submitButtonTranslation = this.getSubmitButtonTranslation();
    // Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
  }

  public loadCarConnectorConnection(): void {
    if (this.currentCarConnectorConnection) {
      this.id.setValue(this.currentCarConnectorConnection.id);
      if (this.currentCarConnectorConnection.name) {
        this.name.setValue(this.currentCarConnectorConnection.name);
      }
      if (this.currentCarConnectorConnection.description) {
        this.description.setValue(this.currentCarConnectorConnection.description);
      }
      if (this.currentCarConnectorConnection.type) {
        this.type.setValue(this.currentCarConnectorConnection.type);
        this.loadConnectionType();
      }
    }
  }

  public loadConnectionType(): void {
    switch (this.currentCarConnectorConnection.type) {
      case CarConnectorConnectionType.MERCEDES:
        this.mercedesConnection = this.currentCarConnectorConnection.mercedesConnection;
        break;
      case CarConnectorConnectionType.TRONITY:
        this.tronityConnection = this.currentCarConnectorConnection.tronityConnection;
        break;
      case CarConnectorConnectionType.TARGA_TELEMATICS:
        this.targaTelematicsConnection =
          this.currentCarConnectorConnection.targaTelematicsConnection;
        break;
    }
  }

  public getSubmitButtonTranslation(): string {
    if (this.currentCarConnectorConnection && this.currentCarConnectorConnection.id) {
      return this.translateService.instant('general.update');
    }
    return this.translateService.instant('general.create');
  }

  public close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public save(carConnectorConnection: CarConnectorConnectionSetting): void {
    if (this.dialogRef) {
      // Generate the ID
      if (!carConnectorConnection.id) {
        carConnectorConnection.id = new Date().getTime().toString();
      }
      this.dialogRef.close(carConnectorConnection);
    }
  }

  public typeChanged(type: CarConnectorConnectionType) {
    if (this.mercedesConnection && type !== CarConnectorConnectionType.MERCEDES) {
      delete this.mercedesConnection;
    }
    if (this.tronityConnection && type !== CarConnectorConnectionType.TRONITY) {
      delete this.tronityConnection;
    }
    if (this.targaTelematicsConnection && type !== CarConnectorConnectionType.TARGA_TELEMATICS) {
      delete this.targaTelematicsConnection;
    }
  }
}
