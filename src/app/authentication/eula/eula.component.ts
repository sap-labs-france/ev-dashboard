import {Component, OnInit} from '@angular/core';
import {CentralServerService} from '../../services/central-server.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './eula.html'
})
export class EulaComponent implements OnInit {
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
