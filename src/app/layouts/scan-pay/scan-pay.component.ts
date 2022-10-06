import { Component, ElementRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SpinnerService } from 'services/spinner.service';

import pkg from '../../../../package.json';

@Component({
  selector: 'app-scan-pay',
  templateUrl: 'scan-pay.component.html',
})
export class ScanPayComponent {

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }
}
