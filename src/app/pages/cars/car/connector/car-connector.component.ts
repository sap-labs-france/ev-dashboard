import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { ComponentService } from 'services/component.service';
import { CarsAuthorizations } from 'types/Authorization';
import { CarConnectorConnectionSetting } from 'types/Setting';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Car } from '../../../../types/Car';
import { HTTPError } from '../../../../types/HTTPError';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-car-connector',
  templateUrl: 'car-connector.component.html',
})
export class CarConnectorComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public car!: Car;
  @Input() public readOnly: boolean;
  @Input() public carsAuthorizations!: CarsAuthorizations;

  public initialized = false;

  public carConnectorName!: AbstractControl;
  public carConnectorID!: AbstractControl;
  public carConnectorMeterID!: AbstractControl;
  public carConnectorConnections!: CarConnectorConnectionSetting[];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private componentService: ComponentService
  ) {}

  public ngOnInit() {
    this.formGroup.addControl(
      'carConnectorData',
      new UntypedFormGroup({
        carConnectorID: new UntypedFormControl('', Validators.compose([])),
        carConnectorMeterID: new UntypedFormControl('', Validators.compose([])),
      })
    );
    this.carConnectorID = this.formGroup.get('carConnectorData.carConnectorID');
    this.carConnectorMeterID = this.formGroup.get('carConnectorData.carConnectorMeterID');
    this.initialized = true;
    this.loadCarConnectors();
    this.loadCar();
  }

  public ngOnChanges() {
    this.loadCar();
  }

  public loadCar() {
    if (this.initialized && this.car && this.carConnectorConnections) {
      const foundCarConnectorConnection = this.carConnectorConnections.find(
        (carConnectorConnection) =>
          carConnectorConnection.id === this.car.carConnectorData?.carConnectorID
      );
      // Set
      if (!Utils.isNullOrUndefined(foundCarConnectorConnection?.id)) {
        this.carConnectorID.setValue(foundCarConnectorConnection.id);
        this.carConnectorMeterID.setValue(this.car.carConnectorData?.carConnectorMeterID);
      } else {
        this.carConnectorMeterID.disable();
      }
    }
  }

  public clearCarConnectorMeterID() {
    this.car.carConnectorData.carConnectorMeterID = null;
    this.carConnectorMeterID.setValue(null);
    this.formGroup.markAsDirty();
  }

  public clearCarConnectorID() {
    this.car.carConnectorData.carConnectorID = null;
    this.carConnectorID.setValue(null);
    this.car.carConnectorData.carConnectorMeterID = null;
    this.carConnectorMeterID.setValue(null);
    this.carConnectorMeterID.disable();
    this.formGroup.markAsDirty();
  }

  public carConnectorChanged(event: MatSelectChange) {
    this.carConnectorID.setValue(event.value);
    if (this.carConnectorID) {
      this.carConnectorMeterID.enable();
    } else {
      this.carConnectorMeterID.disable();
    }
  }

  private loadCarConnectors() {
    this.componentService.getCarConnectorSettings().subscribe({
      next: (settings) => {
        this.carConnectorConnections = settings.carConnector.connections;
        this.loadCar();
      },
      error: (error) => {
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.car_connector.setting_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      },
    });
  }
}
