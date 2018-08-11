import { Injectable } from '@angular/core';

@Injectable()
export class SpinnerService {
  private spinner: HTMLElement;

  constructor() {
    this.spinner = document.getElementById('spinner');
  }

  public show(): void {
    this.spinner.style['display'] = 'block';
  }

  public hide(): void {
    this.spinner.style['display'] = 'none';
  }
}
