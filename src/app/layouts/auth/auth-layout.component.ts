import { Component, ElementRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import pkg from '../../../../package.json';

@Component({
  selector: 'app-layout',
  templateUrl: 'auth-layout.component.html',
})
export class AuthLayoutComponent implements OnInit {
  public version: string = pkg.version;
  public mobileMenuVisible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;

  public constructor(private router: Router, private element: ElementRef) {
    this.sidebarVisible = false;
  }

  public ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;

    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.sidebarClose();
    });
  }

  public sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(() => {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');

    this.sidebarVisible = true;
  }

  public sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  }

  public sidebarToggle() {
    const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
      const $layer = document.createElement('div');
      $layer.setAttribute('class', 'close-layer');
      if (body.querySelectorAll('.wrapper-full-page')) {
        document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
      } else if (body.classList.contains('off-canvas-sidebar')) {
        document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
      }
      setTimeout(() => {
        $layer.classList.add('visible');
      }, 100);
      $layer.onclick = () => {
        // Assign a function
        body.classList.remove('nav-open');
        $layer.classList.remove('visible');
        this.sidebarClose();
      };

      body.classList.add('nav-open');
    } else {
      document.getElementsByClassName('close-layer')[0].remove();
      this.sidebarClose();
    }
  }
}
