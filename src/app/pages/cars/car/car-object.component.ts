import { Component, Injectable, Input, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { MessageService } from 'app/services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-object',
  templateUrl: 'car-object.component.html',
})
@Injectable()
export class CarObjectComponent {
  @Input() carID!: number;
  public carJsonObject!: any;
  constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
  ) {
  }
  ngOnInit(): void {
    // Load
    this.loadData();
  }

  loadData() {
    if (this.carID) {
      this.centralServerService.getCarObject(this.carID).subscribe((car) => {
        if (car) {
          this.carJsonObject = car;
        }
        this.spinnerService.hide();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
    }
  }

}
