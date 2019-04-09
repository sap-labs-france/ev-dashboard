import {Component, ViewEncapsulation} from '@angular/core';
import {AbstractTabComponent} from 'app/shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from 'app/services/window.service';

declare const $: any;

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OrganizationComponent extends AbstractTabComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['companies', 'sites', 'site-areas']);
  }
}
