import { DOCUMENT, Location } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as jQuery from 'jquery';
import { filter } from 'rxjs/operators';

import { RouteGuardService } from '../../guard/route-guard';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
})
export class NavbarComponent implements OnInit {
  @ViewChild('app-navbar') public button: any;

  public location: Location;
  public mobileMenuVisible: any = 0;
  public sidebarMinimized: boolean;
  private listTitles!: any[];
  private toggleButton: any;
  private sidebarVisible: boolean;

  public constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private guard: RouteGuardService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.location = location;
    this.sidebarVisible = false;

    // On Router Change
    router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        if (this.mobileMenuVisible) {
          this.mobileMenuVisible = 0;
        }
      });
  }

  public minimizeSidebar() {
    const body = this.document.getElementsByTagName('body')[0];
    if (this.sidebarMinimized === true) {
      body.classList.remove('sidebar-mini');
      this.sidebarMinimized = false;
    } else {
      setTimeout(() => {
        body.classList.add('sidebar-mini');
        this.sidebarMinimized = true;
      }, 300);
    }
  }

  public hideSidebar() {
    const body = this.document.getElementsByTagName('body')[0];
    const sidebar = this.document.getElementsByClassName('sidebar')[0];
    if (this.sidebarMinimized) {
      setTimeout(() => {
        body.classList.remove('hide-sidebar');
        this.sidebarMinimized = false;
      }, 300);
      setTimeout(() => {
        sidebar.classList.remove('animation');
      }, 600);
      sidebar.classList.add('animation');
    } else {
      setTimeout(() => {
        body.classList.add('hide-sidebar');
        // $('.sidebar').addClass('animation');
        this.sidebarMinimized = true;
      }, 300);
    }
    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(() => {
      window.dispatchEvent(new Event('resize'));
    }, 180);
    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(() => {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  public ngOnInit() {
    if (
      this.activatedRoute &&
      this.activatedRoute.routeConfig &&
      this.activatedRoute.routeConfig.children
    ) {
      this.listTitles = this.activatedRoute.routeConfig.children
        .filter((route) => route.data && route.data.menu && this.guard.isRouteAllowed(route))
        .map((route) => (route.data ? route.data.menu : null));
    }
    const navbar: HTMLElement = this.element.nativeElement;
    const body = this.document.getElementsByTagName('body')[0];
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    if (body.classList.contains('sidebar-mini')) {
      this.sidebarMinimized = true;
    }
    if (body.classList.contains('hide-sidebar')) {
      this.sidebarMinimized = true;
    }
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const $layer = this.document.getElementsByClassName('close-layer')[0];
      if ($layer) {
        $layer.remove();
      }
    });
  }

  public onResize(event: Event) {
    return jQuery(window).width() <= 991;
  }

  public sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = this.document.getElementsByTagName('body')[0];
    setTimeout(() => {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');
    this.sidebarVisible = true;
  }

  public sidebarClose() {
    const body = this.document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  }

  public sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    const body = this.document.getElementsByTagName('body')[0];

    const $toggle = this.document.getElementsByClassName('navbar-toggler')[0];
    if (this.mobileMenuVisible === 1) {
      const $layer = this.document.getElementsByClassName('close-layer')[0];
      body.classList.remove('nav-open');
      if ($layer) {
        $layer.remove();
      }
      setTimeout(() => {
        $toggle.classList.remove('toggled');
      }, 400);
      this.mobileMenuVisible = 0;
    } else {
      setTimeout(() => {
        $toggle.classList.add('toggled');
      }, 430);
      const $layer = this.document.createElement('div');
      $layer.setAttribute('class', 'close-layer');
      if (body.querySelectorAll('.main-panel')) {
        this.document.getElementsByClassName('main-panel')[0].appendChild($layer);
      } else if (body.classList.contains('off-canvas-sidebar')) {
        this.document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
      }
      setTimeout(() => {
        $layer.classList.add('visible');
      }, 100);
      $layer.onclick = () => {
        body.classList.remove('nav-open');
        this.mobileMenuVisible = 0;
        $layer.classList.remove('visible');
        setTimeout(() => {
          $layer.remove();
          $toggle.classList.remove('toggled');
        }, 400);
      };
      body.classList.add('nav-open');
      this.mobileMenuVisible = 1;
    }
  }

  public getTitle() {
    if (this.listTitles) {
      const titleInUrl: string = this.location.prepareExternalUrl(this.location.path());
      for (const title of this.listTitles) {
        if (title.type === 'link' && title.path === titleInUrl) {
          return title.title;
        } else if (title.type === 'sub') {
          for (const child of title.children) {
            const subtitle = title.path + '/' + child.path;
            if (subtitle === titleInUrl) {
              return child.title;
            }
          }
        }
      }
    }
    return '';
  }

  public getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }
}
