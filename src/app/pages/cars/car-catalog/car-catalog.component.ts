import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarCatalog } from '../../../types/Car';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-car-catalog',
  templateUrl: 'car-catalog.component.html',
  styleUrls: ['car-catalog.component.scss'],
})
export class CarCatalogComponent implements OnInit {
  @Input() public currentCarCatalogID!: number;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  public carCatalog: CarCatalog;
  public noImage = Constants.NO_IMAGE;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.loadCar();
  }

  public loadCar() {
    if (!this.currentCarCatalogID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getCarCatalog(this.currentCarCatalogID).subscribe({
      next: (carCatalog: CarCatalog) => {
        this.spinnerService.hide();
        this.carCatalog = carCatalog;
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'cars.car_error'
        );
      },
    });
  }
}
