import { Injectable } from '@angular/core';

@Injectable()
export class SpinnerService {
  public visible: boolean;
  private spinner: HTMLElement;

  constructor() {
    this.spinner = document.getElementById('spinner');
    this.spinner.style['display'] = 'none';
  }

  public show(): void {
    this.spinner.style['display'] = 'block';
    this.visible = true;
  }

  public hide(): void {
    this.spinner.style['display'] = 'none';
    this.visible = false;
  }
}
