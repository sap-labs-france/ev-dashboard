import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarousel, NgbCarouselConfig, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-carousel',
  templateUrl: 'car-carousel.component.html',
  providers: [NgbCarouselConfig], // add NgbCarouselConfig to the component providers
})
export class CarCarouselComponent implements AfterViewInit {
  @Input() public carCatalogID!: number;
  @ViewChild('carousel') public carousel: NgbCarousel;

  public images: string[] = null;
  public noImages = false;

  public constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private messageService: MessageService,
    config: NgbCarouselConfig
  ) {
    // customize default values of carousels used by this component tree
    config.interval = 0;
    config.wrap = false;
    config.keyboard = true;
    config.pauseOnHover = false;
  }

  // Problem binding images with angular 11, will be verified later.
  public ngAfterViewInit() {
    if (this.carCatalogID) {
      this.spinnerService.show();
      this.centralServerService
        .getCarCatalogImages(this.carCatalogID, {}, { limit: 2, skip: Constants.DEFAULT_SKIP })
        .subscribe({
          next: (carImage) => {
            this.spinnerService.hide();
            if (carImage.count > 0) {
              this.images = Array(carImage.count).fill(null);
              // Load the two first images
              this.images[0] = carImage.result[0].image;
              if (carImage.count > 1) {
                this.images[1] = carImage.result[1].image;
              }
            } else {
              this.noImages = true;
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.car_image_error'
            );
          },
        });
    }
  }

  public onSlide(event: NgbSlideEvent) {
    // Load the next image
    const imageIndex = parseInt(event.current.replace('slideId_', ''), 10) + 1;
    if (imageIndex < this.images.length && !this.images[imageIndex]) {
      this.spinnerService.show();
      this.centralServerService
        .getCarCatalogImages(this.carCatalogID, {}, { limit: 1, skip: imageIndex })
        .subscribe({
          next: (carImage) => {
            this.spinnerService.hide();
            this.images[imageIndex] = carImage.result[0].image;
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.car_image_error'
            );
          },
        });
    }
  }
}
