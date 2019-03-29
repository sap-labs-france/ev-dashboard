import {Injectable} from '@angular/core';

@Injectable()
export class SpinnerService {
  private spinner: HTMLElement;

  constructor() {
    this.spinner = document.getElementById('spinner');
    this.spinner.style['display'] = 'none';
  }

  public show(): void {
    this.spinner.style['display'] = 'block';
  }

  public hide(): void {
    this.spinner.style['display'] = 'none';
  }

  public isVisible(): boolean {
    return this.spinner.style['display'] === 'block';
  }
}
