import { Location, PopStateEvent } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from '../../shared/navbar/navbar.component';

declare const $: any;

@Component({
  selector: 'app-layout',
  templateUrl: 'admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('sidebar') public sidebar: any;
  @ViewChild(NavbarComponent, { static: true }) public navbar!: NavbarComponent;

  public url!: string;
  public location: Location;

  private lastPoppedUrl!: string | null;
  private yScrollStack: number[] = [];

  public constructor(private router: Router, location: Location) {
    this.location = location;
  }

  public ngOnInit() {
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
          window.scrollTo(0, this.yScrollStack.pop());
        } else {
          window.scrollTo(0, 0);
        }
      }
    });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
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
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.navbar.sidebarClose();
    });
  }

  public ngAfterViewInit() {
    this.runOnRouteChange();
  }

  public isMap() {
    if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
      return true;
    }
    return false;
  }

  public runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') as HTMLElement;
      const elemMainPanel = document.querySelector('.main-panel') as HTMLElement;
      // let ps = new PerfectScrollbar(elemMainPanel);
      // ps = new PerfectScrollbar(elemSidebar);
      // ps.update();
    }
  }

  public isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.platform.toUpperCase().indexOf('IPAD') >= 0
    ) {
      bool = true;
    }
    return bool;
  }
}
