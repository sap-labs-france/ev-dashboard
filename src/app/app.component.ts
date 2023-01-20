import 'chartjs-adapter-date-fns';

import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';

import { CONNECTOR_ALL_TYPES_MAP } from './shared/model/charging-stations.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  public title = 'Charge Angels';

  public constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer) {
    for (const connectorMap of CONNECTOR_ALL_TYPES_MAP) {
      if (connectorMap.svgIconName) {
        this.iconRegistry.addSvgIcon(
          connectorMap.svgIconName,
          this.sanitizer.bypassSecurityTrustResourceUrl(connectorMap.svgIconFile));
      }
    }
    Chart.register(...registerables);
  }
}
