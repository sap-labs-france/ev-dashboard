import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-card-keyfigure',
  templateUrl: './card-keyfigure.component.html',
  styleUrls: ['./card-keyfigure.scss'],
})
export class CardKeyfigureComponent implements OnChanges {

  @Input() cardIcon: string;
  @Input() cardTitle: string;
  @Input() cardCategory: string;
  @Input() cardFooter?: string;
  @Input() withTrend: boolean;
  @Input() trendTitle?: string;
  @Input() trendValue?: number;
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
  trendingRotation = `scale(0.6,0.6) rotate(${this.trendingRotationValue}deg)`;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.withTrend && (changes.trendValue || changes.currentValue)) {
      this.trendingRotationValue = Math.round((this.currentValue / this.trendValue) * 120 % 60);
      this.trendingRotationValue = (this.currentValue < this.trendValue ?
            this.trendingRotationValue : this.trendingRotationValue * -1)
    }
  }

  setData() {
/*    this.isInitialized = true;
    this.chartButtons = chartButtons;
    // refresh active button data and graph data
    this.chartActiveButton = this.chartButtons.find((button) => button.name === this.chartActiveButton.name);
    this.setChartData(this.chartActiveButton.chart, true);*/
  }

}
