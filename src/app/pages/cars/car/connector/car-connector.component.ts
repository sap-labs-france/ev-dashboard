import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { ComponentService } from 'services/component.service';
import { CarsAuthorizations, DialogMode } from 'types/Authorization';
import { CarConnectorConnectionSetting, CarConnectorConnectionType } from 'types/Setting';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Car, CarConnectorData } from '../../../../types/Car';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-car-connector',
  templateUrl: 'car-connector.component.html',
})
export class CarConnectorComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public car!: Car;
  @Input() public dialogMode: DialogMode;
  @Input() public carsAuthorizations!: CarsAuthorizations;

  public initialized = false;

  public carConnectorID!: AbstractControl;
  public carConnectors!: CarConnectorConnectionSetting[];
  public selectedCarConnector!: CarConnectorConnectionSetting;
  public readonly CarConnectorConnectionType = CarConnectorConnectionType;
  public readonly DialogMode = DialogMode;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private componentService: ComponentService ) {
  }

  public ngOnInit() {
    this.formGroup.addControl(
      'carConnectorData', new UntypedFormGroup({
        carConnectorID: new FormControl(null),
      }));
    this.carConnectorID = this.formGroup.get('carConnectorData.carConnectorID');
    this.initialized = true;
    this.loadCarConnectors();
  }

  public ngOnChanges() {
    this.loadCarConnector();
  }

  public loadCarConnector() {
    if (this.initialized && this.car && this.carConnectors) {
      this.selectedCarConnector = this.carConnectors.find((carConnectorConnection) =>
        carConnectorConnection.id ===  this.car.carConnectorData?.carConnectorID);
      this.carConnectorID.setValue(this.selectedCarConnector?.id);
    }
  }

  public clearCarConnectorID() {
    this.carConnectorID.setValue(null);
    this.car.carConnectorData = {} as CarConnectorData;
    // Reset Form Group
    this.formGroup.controls['carConnectorData'] = new UntypedFormGroup({
      carConnectorID: new FormControl(null),
    });
    this.formGroup.markAsDirty();
    setTimeout(() => this.selectedCarConnector = null, 0);
  }

  public carConnectorChanged(carConnectorID: string) {
    this.selectedCarConnector = this.carConnectors.find((carConnectorConnection) =>
      carConnectorConnection.id ===  carConnectorID);
    this.carConnectorID.setValue(this.selectedCarConnector.id);
    this.formGroup.markAsDirty();
  }

  private loadCarConnectors() {
    this.componentService.getCarConnectorSettings().subscribe({
      next: (settings) => {
        this.carConnectors = settings.carConnector.connections;
        this.loadCarConnector();
      },
      error: (error) => {
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.car_connector.setting_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      }
    });
  }
}
