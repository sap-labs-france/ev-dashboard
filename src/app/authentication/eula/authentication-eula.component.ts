import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../services/central-server.service';

@Component({
  templateUrl: './authentication-eula.component.html'
})
export class AuthenticationEulaComponent implements OnInit {
  public eulaText: string;

  constructor(
    private translateService: TranslateService,
    private centralServerService: CentralServerService) {
  }

  ngOnInit() {
    this.centralServerService.getEndUserLicenseAgreement(this.translateService.getBrowserLang()).subscribe((uela) => {
      this.eulaText = uela.text;
    });
  }
}
