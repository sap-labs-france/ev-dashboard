import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-settings-technical',
  templateUrl: './settings-technical.component.html'
})
export class SettingsTechnicalComponent extends AbstractTabComponent {
  public constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['crypto', 'users']);
  }
}
