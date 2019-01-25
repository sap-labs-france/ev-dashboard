import {filter} from 'rxjs/operators';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SpinnerService} from './services/spinner.service';
import 'moment-duration-format';

@Component({
  selector: 'app-my-app',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, AfterViewInit {
  private _router: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router) {
  }

  ngOnInit() {
    this._router = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const body = document.getElementsByTagName('body')[0];
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        modalBackdrop.remove();
      }
    });
    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
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

  ngAfterViewInit() {
    // Hide
    setTimeout(() => {
      // Hide
      this.spinnerService.hide();
    }, 1000);
  }
}
