import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-charging-station-templates',
  templateUrl: 'charging-station-templates.component.html',
})
export class ChargingStationTemplatesComponent extends AbstractTabComponent {
  public constructor(activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['charging-station-templates']);
  }
}
