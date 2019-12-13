
import { Location, PopStateEvent } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

declare const $: any;

@Component({
  selector: 'app-layout',
  templateUrl: './admin-layout.component.html',
})

export class AdminLayoutComponent implements OnInit, AfterViewInit {
  url!: string;
  location: Location;

  @ViewChild('sidebar', { static: false }) sidebar: any;
  @ViewChild(NavbarComponent, { static: true }) navbar!: NavbarComponent;
  private _router!: Subscription;
  private lastPoppedUrl!: string|null;
  private yScrollStack: number[] = [];

  constructor(private router: Router, location: Location) {
    this.location = location;
  }

  ngOnInit() {
    const elemMainPanel = document.querySelector('.main-panel') as HTMLElement;
    const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') as HTMLElement;
    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev && ev.url ? ev.url : null;
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url !== this.lastPoppedUrl) {
          this.yScrollStack.push(window.scrollY);
        }
      } else if (event instanceof NavigationEnd) {
        if (event.url === this.lastPoppedUrl) {
          this.lastPoppedUrl = null;
          // @ts-ignore
          window.scrollTo(0, this.yScrollStack.pop());
        } else {
          window.scrollTo(0, 0);
        }
      }
    });
    this._router = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      elemMainPanel.scrollTop = 0;
      elemSidebar.scrollTop = 0;
    });
    const html = document.getElementsByTagName('html')[0];
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      // let ps = new PerfectScrollbar(elemMainPanel);
      // ps = new PerfectScrollbar(elemSidebar);
      html.classList.add('perfect-scrollbar-on');
    } else {
      html.classList.add('perfect-scrollbar-off');
    }
    this._router = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.navbar.sidebarClose();
    });
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  public isMap() {
    if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
      return true;
    } else {
      return false;
    }
  }

  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') as HTMLElement;
      const elemMainPanel = document.querySelector('.main-panel') as HTMLElement;
      // let ps = new PerfectScrollbar(elemMainPanel);
      // ps = new PerfectScrollbar(elemSidebar);
      // ps.update();
    }
  }

  isMac(): boolean {
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }
}
