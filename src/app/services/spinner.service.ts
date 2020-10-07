import { Injectable } from '@angular/core';

@Injectable()
export class SpinnerService {
  public visible = false;
  private spinner: HTMLElement | null;

  constructor() {
    this.spinner = document.getElementById('spinner');
    if (this.spinner) {
      this.spinner.style['display'] = 'none';
    }
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public show(): void {
    if (this.spinner) {
      this.spinner.style['display'] = 'block';
      this.visible = true;
    }
  }

  public hide(): void {
    if (this.spinner) {
      this.spinner.style['display'] = 'none';
      this.visible = false;
    }
  }
}
