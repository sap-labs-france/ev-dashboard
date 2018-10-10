import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SpinnerService } from './services/spinner.service';
import { CentralServerService } from './services/central-server.service';

@Component({
  selector: 'app-my-app',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, AfterViewInit {
  private _router: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerService: CentralServerService) {
  }

  ngOnInit() {
    this.centralServerService.verifyTenant().subscribe(() => {
      this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
        const body = document.getElementsByTagName('body')[0];
        const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
        if (body.classList.contains('modal-open')) {
          body.classList.remove('modal-open');
          modalBackdrop.remove();
        }
      });
    }, (error) => {
      // Redirect to the not found page
      this.router.navigate(['not-found']);
    });
  }

  ngAfterViewInit() {
    // Hide
    setTimeout(() => {
      // Hide
      this.spinnerService.hide();
    }, 1000);
  }
}
