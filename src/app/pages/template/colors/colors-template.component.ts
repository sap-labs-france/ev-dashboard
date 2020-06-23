import { Component } from '@angular/core';

@Component({
  selector: 'app-colors-template',
  templateUrl: './colors-template.component.html',
})

export class ColorsTemplateComponent {
  public palettes = ['primary', 'accent', 'warn', 'success', 'warning', 'yellow', 'purple', 'grey', 'brown', 'blue-grey',
    'deep-orange', 'lime', 'light-green', 'teal', 'cyan', 'indigo', 'pink', 'red'];
  public paletteLevels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
  public backgroundProps = ['status-bar', 'app-bar', 'background', 'hover', 'card', 'dialog', 'disabled-button', 'raised-button',
    'focused-button', 'selected-button', 'selected-disabled-button', 'disabled-button-toggle'];
  public foregroundProps = ['base', 'divider', 'dividers', 'disabled', 'disabled-button', 'disabled-text',
    'hint-text', 'secondary-text', 'icon', 'icons', 'text', 'slider-off', 'slider-off-active'];
}
