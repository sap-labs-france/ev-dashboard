import { Component } from '@angular/core';

import { SpinnerService } from '../../services/spinner.service';

@Component({
  templateUrl: 'authentication-mercedes-data-usage.component.html',
})
export class AuthenticationMercedesDataUsageComponent {
  public constructor(private spinnerService: SpinnerService) {
    this.spinnerService.hide();
  }
}
