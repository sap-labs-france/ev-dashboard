import { AfterViewInit, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselConfig, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-carousel',
  templateUrl: './car-carousel.component.html',
  providers: [NgbCarouselConfig],  // add NgbCarouselConfig to the component providers
})
export class CarCarouselComponent implements AfterViewInit {
  @Input() public carCatalogID!: number;
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

  // public ngAfterViewInit() {
  //   if (this.carCatalogID) {
  //     this.spinnerService.show();
  //     this.centralServerService.getCarCatalogImages(this.carCatalogID, {},
  //       { limit: Constants.MAX_LIMIT, skip: Constants.DEFAULT_SKIP }).subscribe((carImages) => {
  //         this.spinnerService.hide();
  //         this.images = Array.from(carImages.result, carImage => carImage.image);
  //       }, (error) => {
  //         this.spinnerService.hide();
  //         Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_image_error');
  //       });
  //   }
  // }

  // Problem binding images with angular 11, will be verified later.
  public ngAfterViewInit() {
    if (this.carCatalogID) {
      this.spinnerService.show();
      this.centralServerService.getCarCatalogImages(this.carCatalogID, {},
        { limit: 1, skip: Constants.DEFAULT_SKIP }).subscribe((carImage) => {
          this.spinnerService.hide();
          this.images = Array(carImage.count).fill(null);
          this.images[0] = carImage.result[0].image;
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_image_error');
        });
    }
  }

  public onSlide(event: NgbSlideEvent) {
    const imageIndex = parseInt(event.current.replace('slideId_', ''), 10);
    if (!this.images[imageIndex]) {
      this.spinnerService.show();
      this.loading = true;
      this.centralServerService.getCarCatalogImages(this.carCatalogID, {}, { limit: 1, skip: imageIndex }).subscribe((carImage) => {
        this.spinnerService.hide();
        this.images = [...this.images];
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

