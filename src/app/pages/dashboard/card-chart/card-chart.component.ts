import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger, AnimationEvent, query, group, sequence } from '@angular/animations';

const DEFAULT_CHART_INTERVAL = 5000;

export interface ChartButton {
  name: string;
  title: string;
  chart?: ChartDefinition
}

export interface ChartData {
  datasets: [],
  labels: []
}

export interface ChartDefinition {
  options: any,
  data: ChartData,
}

interface ChartDataLocal {
  chartData: ChartDefinition,
  isDisplayed: boolean
}

@Component({
  selector: 'app-card-chart',
  templateUrl: './card-chart.component.html',
  styleUrls: ['./card-chart.scss'],
  animations: [
    trigger('ChartFade', [
      transition('false => true', [
        group([
          query('.first-chart', [
            animate('2s ease', style({ opacity: '0' })),
          ]),
          query('.second-chart', [
            animate('2s ease', style({ opacity: '1' })),
          ]),
        ]),
      ]),
      transition('true => false', [
        group([
          query('.first-chart', [
            animate('2s ease', style({ opacity: '1' })),
          ]),
          query('.second-chart', [
            animate('2s ease', style({ opacity: '0' })),
          ]),
        ]),
      ])
    ])
  ]
})

export class CardChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() chartType: string;
  @Input() chartButtons: ChartButton[];
  @Input() autoRotateAtStart = true;

  @Input() cardIcon: string;
  @Input() cardTitle: string;
  @Input() cardFooter?: string;
  @Input() rotationInterval?: number;

  @Input() cardClass?: string;
  @Input() headerClass?: string;
  @Input() titleClass?: string;
  @Input() categoryClass?: string;
  @Input() bodyClass?: string;
  @Input() footerClass?: string;

  @Output() activeButtonChanged = new EventEmitter<ChartButton>();

  isPaused: boolean;
  rotationIntervalReference;

  chartActiveButton: ChartButton;

  isInitialized = false;

  firstChart: ChartDataLocal = {
    chartData: { options: [], data: { datasets: [], labels: [] } },
    isDisplayed: true
  }
  secondChart = {
    chartData: { options: [], data: { datasets: [], labels: [] } },
    isDisplayed: false
  }

  changeFromFirstToSecond = false;

  animationOngoing = false;

  constructor() {
  }

  ngOnInit(): void {
    this.chartActiveButton = this.chartButtons[0];
    if (this.chartButtons[0].chart) {
      this.isInitialized = true;
    }
  }

  ngAfterViewInit(): void {
    this.isPaused = true;
    // Start automatic rotation
    if (this.autoRotateAtStart) {
      this.startRotation(this.chartButtons[0]);
    }
    if (this.chartButtons[0].chart) {
      this.isInitialized = true;
    }
  }

  ngOnDestroy(): void {
    this.pauseRotation();
  }

  setData(chartButtons: ChartButton[]) {
    this.isInitialized = true;
    this.chartButtons = chartButtons;
    // refresh active button data and graph data
    this.chartActiveButton = this.chartButtons.find((button) => button.name === this.chartActiveButton.name);
    this.setChartData(this.chartActiveButton.chart, true);
  }

  pauseRotation() {
    if (!this.isPaused) {
      clearInterval(this.rotationIntervalReference);
      this.rotationIntervalReference = null;
      this.isPaused = true;
    }
  }

  startRotation(startingButton?: ChartButton) {
    if (this.isPaused) {
      if (startingButton) {
        this.nextChart(startingButton.name);
      }
      this.rotationIntervalReference = setInterval(() => this.nextChart(),
        (this.rotationInterval ? this.rotationInterval : DEFAULT_CHART_INTERVAL));
      this.isPaused = false;
    }
  }

  nextChart(chartName = null) {
    if (this.chartButtons) {
      let indexChart: number;
      // Get button info and data
      if (!chartName) {
        indexChart = this.chartButtons.findIndex((button) => button.name === this.chartActiveButton.name);
        if (indexChart === this.chartButtons.length - 1) {
          indexChart = 0;
        } else {
          indexChart += 1;
        }
      } else {
        indexChart = this.chartButtons.findIndex((button) => button.name === chartName);
      }
      if (!this.isPaused && !chartName) {
        // Change current button and data
        this.chartChangeTo(this.chartButtons[indexChart]);
        this.firstChart.isDisplayed = true;
        this.secondChart.isDisplayed = true;
        // rotate screen with animation
        this.changeFromFirstToSecond = !this.changeFromFirstToSecond;
        this.animationOngoing = true;
      } else {
        // manual change so activate only the proper chart
        // Change current button and data
        this.chartChangeTo(this.chartButtons[indexChart], true);
      }
    }
  }

  private chartChangeTo(button: ChartButton, manualChange = false) {
    this.chartActiveButton = button;
    this.activeButtonChanged.emit(button);
    if (button.chart) {
      this.setChartData(button.chart, manualChange);
    }
  }

  private setChartData(chartDefinition: ChartDefinition, manualChange: boolean) {
    if (!this.isInitialized) {
      // Init case
      this.firstChart.chartData = chartDefinition;
    } else {
      if (!this.changeFromFirstToSecond) {
        if (manualChange) { // do not rotate screens
          this.firstChart.chartData = chartDefinition;
        } else {
          this.secondChart.chartData = chartDefinition;
        }
      } else {
        if (manualChange) { // do not rotate screens
          this.secondChart.chartData = chartDefinition;
        } else {
          this.firstChart.chartData = chartDefinition;
        }
      }
    }
  }

  chartFadeOutComplete(event?: AnimationEvent) {
    if (this.animationOngoing) {
      this.animationOngoing = false;
      if (this.changeFromFirstToSecond) {
        this.firstChart.isDisplayed = false;
        this.secondChart.isDisplayed = true;
      } else {
        this.secondChart.isDisplayed = false;
        this.firstChart.isDisplayed = true;
      }
    }
  }

}
