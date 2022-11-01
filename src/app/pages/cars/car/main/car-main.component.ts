import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { CarsAuthorizations, DialogMode } from 'types/Authorization';

import { SpinnerService } from '../../../../services/spinner.service';
import { CarCatalogsDialogComponent } from '../../../../shared/dialogs/car-catalogs/car-catalogs-dialog.component';
import { Car, CarCatalog, CarConverter, CarConverterType, CarType } from '../../../../types/Car';
import { KeyValue } from '../../../../types/GlobalType';
import { User } from '../../../../types/User';
import { Cars } from '../../../../utils/Cars';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-car-main',
  templateUrl: 'car-main.component.html',
})
export class CarMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public car!: Car;
  @Input() public dialogMode: DialogMode;
  @Input() public carsAuthorizations!: CarsAuthorizations;

  public readonly DialogMode = DialogMode;
  public carCatalogImage: string;
  public selectedCarCatalog: CarCatalog;
  public carCatalogConverters: { type: CarConverterType; value: string; converter: CarConverter }[] = [];
  public canListUsers: boolean;
  public isCarConnectorComponentActive: boolean;
  public initialized = false;

  public id!: AbstractControl;
  public vin!: AbstractControl;
  public licensePlate!: AbstractControl;
  public isCompanyCar!: AbstractControl;
  public carCatalogID!: AbstractControl;
  public carCatalog!: AbstractControl;
  public converterType!: AbstractControl;
  public converter!: AbstractControl;
  public isDefault!: AbstractControl;
  public type!: AbstractControl;
  public noImage = Constants.NO_IMAGE;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public carTypes: KeyValue[] = [
    { key: CarType.COMPANY, value: 'cars.company_car' },
    { key: CarType.PRIVATE, value: 'cars.private_car' }
  ];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private translateService: TranslateService,
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    this.formGroup.addControl('id', new UntypedFormControl(''));
    this.formGroup.addControl('vin', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
        Cars.validateVIN
      ])));
    this.formGroup.addControl('licensePlate', new UntypedFormControl('',
      Validators.compose([
        Validators.pattern('^[A-Z0-9- ]*$'),
      ])));
    this.formGroup.addControl('carCatalog', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('carCatalogID', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('converterType', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('converter', new UntypedFormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('user', new UntypedFormControl(''));
    this.formGroup.addControl('userID', new UntypedFormControl(''));
    this.formGroup.addControl('isDefault', new UntypedFormControl(''));
    this.formGroup.addControl('type', new UntypedFormControl(CarType.COMPANY,
      Validators.compose([
        Validators.required,
      ])));
    // Form
    this.id = this.formGroup.controls['id'];
    this.vin = this.formGroup.controls['vin'];
    this.licensePlate = this.formGroup.controls['licensePlate'];
    this.carCatalogID = this.formGroup.controls['carCatalogID'];
    this.carCatalog = this.formGroup.controls['carCatalog'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.isDefault = this.formGroup.controls['isDefault'];
    this.converterType = this.formGroup.controls['converterType'];
    this.converter = this.formGroup.controls['converter'];
    this.type = this.formGroup.controls['type'];
    // Default
    this.converterType.disable();
    // Pool Car
    if(this.carsAuthorizations.metadata?.createPoolCar?.visible) {
      this.carTypes.push({ key: CarType.POOL_CAR, value: 'cars.pool_car' });
    }
    // User ID
    if(this.carsAuthorizations.metadata?.userID?.mandatory) {
      this.user.setValidators(Validators.required);
      this.userID.setValidators(Validators.required);
    }
    this.initialized = true;
    this.loadCar();
  }

  public ngOnChanges() {
    this.loadCar();
  }

  public loadCar() {
    if (this.initialized && this.car) {
      this.id.setValue(this.car.id);
      this.carCatalogID.setValue(this.car.carCatalogID);
      this.selectedCarCatalog = this.car.carCatalog;
      this.buildCarCatalogConverter();
      this.vin.setValue(this.car.vin);
      this.licensePlate.setValue(this.car.licensePlate);
      this.type.setValue(this.car.type);
      this.converter.setValue(this.car.converter);
      this.converterType.setValue(this.car.converter.type);
      this.carCatalog.setValue(Utils.buildCarCatalogName(this.car.carCatalog));
      this.carCatalogImage = this.car.carCatalog.image;
      this.isDefault.setValue(this.car.default);
      this.userID.setValue(this.car.userID);
      if (this.car.user) {
        this.user.setValue(Utils.buildUserFullName(this.car.user));
      }
    }
  }

  public converterChanged(event: MatSelectChange) {
    this.converter.setValue(
      this.carCatalogConverters.find((converter) => converter.type === event.value).converter
    );
  }

  public clearUser() {
    this.car.user = null;
    this.car.userID = null;
    this.user.setValue(null);
    this.userID.setValue(null);
    this.formGroup.markAsDirty();
  }

  public assignUser() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'cars.assign_user',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(UsersDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const user = ((result[0].objectRef) as User);
        this.user.setValue(Utils.buildUserFullName(user));
        this.userID.setValue(user.id);
        this.formGroup.markAsDirty();
      }
    });
  }

  public changeCarCatalog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'cars.assign_car_catalog',
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(CarCatalogsDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const carCatalog: CarCatalog = (result[0].objectRef) as CarCatalog;
        this.carCatalogID.setValue(result[0].key);
        this.carCatalog.setValue(Utils.buildCarCatalogName(carCatalog));
        this.selectedCarCatalog = carCatalog;
        this.carCatalogImage = carCatalog.image;
        // Build drop down
        this.buildCarCatalogConverter();
        this.formGroup.markAsDirty();
      }
    });
  }

  private buildCarCatalogConverter() {
    const standardConverter: CarConverter = {
      type: CarConverterType.STANDARD,
      powerWatts: this.selectedCarCatalog.chargeStandardPower,
      amperagePerPhase: this.selectedCarCatalog.chargeStandardPhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeStandardPhase,
    };
    const alternativeConverter: CarConverter = {
      type: CarConverterType.ALTERNATIVE,
      powerWatts: this.selectedCarCatalog.chargeAlternativePower,
      amperagePerPhase: this.selectedCarCatalog.chargeAlternativePhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeAlternativePhase,
    };
    const optionalConverter: CarConverter = {
      type: CarConverterType.OPTION,
      powerWatts: this.selectedCarCatalog.chargeOptionPower,
      amperagePerPhase: this.selectedCarCatalog.chargeOptionPhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeOptionPhase,
    };
    this.carCatalogConverters = [{
      type: CarConverterType.STANDARD,
      value: Utils.buildCarCatalogConverterName(standardConverter, this.translateService),
      converter: standardConverter,
    }];
    if (this.selectedCarCatalog.chargeAlternativePower) {
      this.carCatalogConverters.push({
        type: CarConverterType.ALTERNATIVE,
        value: Utils.buildCarCatalogConverterName(alternativeConverter, this.translateService),
        converter: alternativeConverter,
      });
    }
    if (this.selectedCarCatalog.chargeOptionPower > 0 &&
        this.selectedCarCatalog.chargeOptionPower !== this.selectedCarCatalog.chargeAlternativePower) {
      this.carCatalogConverters.push({
        type: CarConverterType.OPTION,
        value: Utils.buildCarCatalogConverterName(optionalConverter, this.translateService),
        converter: optionalConverter,
      });
    }
    // Set default
    if (this.carCatalogConverters.length === 1) {
      this.converterType.setValue(this.carCatalogConverters[0].type);
      this.converter.setValue(this.carCatalogConverters[0].converter);
    } else {
      this.converterType.setValue('');
    }
    this.converterType.enable();
  }
}
