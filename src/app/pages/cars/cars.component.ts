import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from 'app/services/window.service';
import { AbstractTabComponent } from 'app/shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
})
export class CarsComponent extends AbstractTabComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['cars']);
  }
}
