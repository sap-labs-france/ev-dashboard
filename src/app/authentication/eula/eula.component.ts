import { Component, OnInit } from '@angular/core';
import { CentralServerService } from '../../service/central-server.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './eula.html'
})
export class EulaComponent implements OnInit {
  public eulaText: string;

  constructor(
    private translate: TranslateService,
    private centralServerService: CentralServerService) {
  }

  ngOnInit() {
    this.centralServerService.getEndUserLicenseAgreement(this.translate.getBrowserLang()).subscribe((uela) => {
      this.eulaText = uela.text;
    });
  }
}
