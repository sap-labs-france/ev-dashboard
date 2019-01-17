import {Injectable} from '@angular/core';

@Injectable()
export class SpinnerService {
  private spinner: HTMLElement;
  private spinnerLight: HTMLElement;

  constructor() {
    this.spinner = document.getElementById('spinner');
    this.spinnerLight = document.getElementById('spinner-light');
    this.spinnerLight.style['display'] = 'none';
    this.spinner.style['display'] = 'none';
  }

  public show(spinnerLight = false): void {
    if (spinnerLight) {
      this.spinnerLight.style['display'] = 'block';
    } else {
      this.spinner.style['display'] = 'block';
    }
  }

  public hide(spinnerLight = false): void {
    if (spinnerLight) {
      this.spinnerLight.style['display'] = 'none';
    } else {
      this.spinner.style['display'] = 'none';
    }
  }
}
