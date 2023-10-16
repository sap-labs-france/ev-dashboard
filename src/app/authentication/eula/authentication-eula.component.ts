import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'services/window.service';

import { CentralServerService } from '../../services/central-server.service';
import { SpinnerService } from '../../services/spinner.service';
@Component({
  templateUrl: 'authentication-eula.component.html',
})
export class AuthenticationEulaComponent implements OnInit {
  public eulaText!: string;
  public constructor(
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private windowService: WindowService,
    private centralServerService: CentralServerService
  ) {
    this.spinnerService.hide();
  }
  public ngOnInit() {
    const language = this.windowService.getUrlParameterValue('Language');
    this.centralServerService
      .getEndUserLicenseAgreement(language ?? this.translateService.getBrowserLang())
      .subscribe((eula) => {
        this.eulaText = eula.text;
      });
  }
}
