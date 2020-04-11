import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselConfig, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-carousel',
  templateUrl: './car-carousel.component.html',
  providers: [NgbCarouselConfig],  // add NgbCarouselConfig to the component providers
})
export class CarCarouselComponent implements AfterViewInit {
  @Input() carID!: number;
  public images!: string[];
  public loading = false;
  constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private messageService: MessageService,
    config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.interval = 0;
    config.wrap = false;
    config.keyboard = true;
    config.pauseOnHover = false;
  }

  ngAfterViewInit() {
    if (this.carID) {
      this.centralServerService.getCarImages(this.carID, {}, { limit: 1, skip: Constants.DEFAULT_SKIP }).subscribe((carImage) => {
        this.images = Array(carImage.count).fill('');
        this.images[0] = carImage.result[0].image;
        this.spinnerService.hide();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_image_error');
      });
    }
  }

  onSlide(event: NgbSlideEvent) {
    const imageIndex = parseInt(event.current.replace('slideId_', ''), 10);
    if (this.images[imageIndex] === '') {
      this.spinnerService.show();
      this.loading = true;
      this.centralServerService.getCarImages(this.carID, {}, { limit: 1, skip: imageIndex }).subscribe((carImage) => {
        this.spinnerService.hide();
        this.images[imageIndex] = carImage.result[0].image;
        this.loading = false;
      }, (error) => {
        // Show error
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_image_error');
      });
    }
  }
}
