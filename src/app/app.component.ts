import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { CONNECTOR_TYPE_MAP } from './shared/formatters/app-connector-type.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public title = 'e-Mobility';

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer) {
      for (const connectorMap of CONNECTOR_TYPE_MAP) {
        if (connectorMap.svgIconName) {
          iconRegistry.addSvgIcon(
            connectorMap.svgIconName,
            sanitizer.bypassSecurityTrustResourceUrl(connectorMap.svgIconFile));
        }
      }
  }
}
