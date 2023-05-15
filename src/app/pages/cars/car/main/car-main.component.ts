import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { CarsAuthorizations } from 'types/Authorization';

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
  @Input() public formGroup: FormGroup;
  @Input() public car!: Car;
  @Input() public readOnly: boolean;
  @Input() public carsAuthorizations!: CarsAuthorizations;

  public carCatalogImage: string;
  public selectedCarCatalog: CarCatalog;
  public carCatalogConverters: {
    type: CarConverterType;
    value: string;
    converter: CarConverter;
  }[] = [];
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
  public default!: AbstractControl;
  public type!: AbstractControl;
  public noImage = Constants.NO_IMAGE;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public carTypes: KeyValue[] = [
    { key: CarType.COMPANY, value: 'cars.company_car' },
    { key: CarType.PRIVATE, value: 'cars.private_car' },
  ];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl(
      'vin',
      new FormControl('', Validators.compose([Validators.required, Cars.validateVIN]))
    );
    this.formGroup.addControl(
      'licensePlate',
      new FormControl('', Validators.compose([Validators.pattern('^[A-Z0-9- ]*$')]))
    );
    this.formGroup.addControl(
      'carCatalog',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'carCatalogID',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'converterType',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl(
      'converter',
      new FormControl('', Validators.compose([Validators.required]))
    );
    this.formGroup.addControl('user', new FormControl(''));
    this.formGroup.addControl('userID', new FormControl(''));
    this.formGroup.addControl('default', new FormControl<boolean>(false));
    this.formGroup.addControl(
      'type',
      new FormControl<CarType>(CarType.COMPANY, Validators.compose([Validators.required]))
    );
    // Form
    this.id = this.formGroup.controls['id'];
    this.vin = this.formGroup.controls['vin'];
    this.licensePlate = this.formGroup.controls['licensePlate'];
    this.carCatalogID = this.formGroup.controls['carCatalogID'];
    this.carCatalog = this.formGroup.controls['carCatalog'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.default = this.formGroup.controls['default'];
    this.converterType = this.formGroup.controls['converterType'];
    this.converter = this.formGroup.controls['converter'];
    this.type = this.formGroup.controls['type'];
    // Default
    this.converterType.disable();
    // Pool Car
    if (this.carsAuthorizations.metadata?.createPoolCar?.visible) {
      this.carTypes.push({ key: CarType.POOL_CAR, value: 'cars.pool_car' });
    }
    // User ID
    if (this.carsAuthorizations.metadata?.userID?.mandatory) {
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
      this.default.setValue(this.car.default);
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
    this.dialog
      .open(UsersDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const user = result[0].objectRef as User;
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
    this.dialog
      .open(CarCatalogsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        if (!Utils.isEmptyArray(result) && result[0].objectRef) {
          const carCatalog: CarCatalog = result[0].objectRef as CarCatalog;
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
    this.carCatalogConverters = [
      {
        type: CarConverterType.STANDARD,
        value: Utils.buildCarCatalogConverterName(standardConverter, this.translateService),
        converter: standardConverter,
      },
    ];
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
