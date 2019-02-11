import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Card to display one keyfigure. Default style is a card-stats
 * Possibility to also display a moving arrow according to a given trend.
 *
 * @export
 * @class CardKeyfigureComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-card-keyfigure',
  templateUrl: './card-keyfigure.component.html',
  styleUrls: ['./card-keyfigure.scss'],
})
export class CardKeyfigureComponent implements OnChanges {

  /**
   * material design icon name
   *
   * @type {string}
   * @memberof CardKeyfigureComponent
   */
  @Input() cardIcon: string;
  /**
   * Title text displayed in the card.
   * It corresponds to the keyfigure value.
   * It can be a i18n entry.
   *
   * @type {string}
   * @memberof CardKeyfigureComponent
   */
  @Input() cardTitle: string;
  /**
   * Category text.
   * It can be an i18n entry.
   *
   * @type {string}
   * @memberof CardKeyfigureComponent
   */
  @Input() cardCategory: string;
  /**
   * Footer text.
   * It can be an i18n entry.
   *
   * @type {string}
   * @memberof CardKeyfigureComponent
   */
  @Input() cardFooter?: string;
  /**
   * If true an arrow representing the trend compared to current value will be moving
   *
   * @type {boolean}
   * @memberof CardKeyfigureComponent
   */
  @Input() withTrend: boolean;
  /**
   * trend Tooltip displayed on hover the arrow icon
   *
   * @type {string}
   * @memberof CardKeyfigureComponent
   */
  @Input() trendTitle?: string;
  /**
   * The trend value reference
   *
   * @type {number}
   * @memberof CardKeyfigureComponent
   */
  @Input() trendValue?: number;
  /**
   * The current value.
   * If current vlaue is above trend value, the arrow will go up
   * otherwise it will go down
   * The angle is between -60deg to +60deg based on the ratio of current value / trend value
   * @type {number}
   * @memberof CardKeyfigureComponent
   */
  @Input() currentValue?: number;

  @Input() cardClass?: string;
  @Input() headerClass?: string;
  @Input() titleClass?: string;
  @Input() iconClass?: string;
  @Input() trendClass?: string;
  @Input() categoryClass?: string;
  @Input() footerClass?: string;


  isInitialized = false;

  trendingRotationValue = 0;
  /**
   * Style applied to teh arrow to rotate according to the trend
   *
   * @memberof CardKeyfigureComponent
   */
  trendingRotation = `scale(0.6,0.6) rotate(${this.trendingRotationValue}deg)`;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.withTrend && (changes.trendValue || changes.currentValue)) {
      // Calculate new trend value
      this.trendingRotationValue = Math.round((this.currentValue / this.trendValue) * 120 % 60);
      this.trendingRotationValue = (this.currentValue < this.trendValue ?
            this.trendingRotationValue : this.trendingRotationValue * -1)
    }
  }

  setData() {
  }

}
