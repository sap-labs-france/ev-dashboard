import {Component, ViewEncapsulation} from '@angular/core';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import {ComponentEnum, ComponentService} from '../../services/component.service';

// declare const $: any;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  encapsulation: ViewEncapsulation.None
})

export class StatisticsComponent extends AbstractTabComponent {

  constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['consumption', 'usage']);
  }
}
