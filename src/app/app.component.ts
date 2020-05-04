import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SpinnerService } from './services/spinner.service';
import { CONNECTOR_TYPE_MAP } from './shared/formatters/app-connector-type.pipe';

@Component({
  selector: 'app-my-app',
  templateUrl: './app.component.html',
})

export class AppComponent implements OnInit, AfterViewInit {
  private _router!: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
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

  public ngOnInit() {
    this._router = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const body = document.getElementsByTagName('body')[0];
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        modalBackdrop.remove();
      }
    });
    // @ts-ignore
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      let url = event.url;
      let modified = false;
      if (url.startsWith('/#/')) {
        url = url.substr(2);
        modified = true;
      }
      if (url.includes('%23')) {
        url = url.replace('%23', '#');
        modified = true;
      }
      if (modified) {
        this.router.navigateByUrl(url);
      }
    });
  }

  public ngAfterViewInit() {
    // Hide
    setTimeout(() => {
      // Hide
      this.spinnerService.hide();
    }, 1000);
  }
}
