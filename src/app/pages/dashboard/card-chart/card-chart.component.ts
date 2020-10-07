import { AnimationEvent, animate, group, query, sequence, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

const DEFAULT_CHART_INTERVAL = 5000;

/**
 * Definition of a button within a card chart component
 *
 * @export
 * @interface ChartButton
 */
export interface ChartButton {
  /**
   * name of the button that must be unique
   *
   * @type {string}
   * @memberof ChartButton
   */
  name: string;
  /**
   * Text displayed for the button.
   * It can be a i18n entry.
   * @type {string}
   * @memberof ChartButton
   */
  title: string;
  /**
   * Chart data associated with the button
   *
   * @type {ChartDefinition}
   * @memberof ChartButton
   */
  chart?: ChartDefinition;
}

/**
 * data and labels of a chart.
 * See chartjs for further details.
 * @export
 * @interface ChartData
 */
export interface ChartData {
  datasets: [];
  labels: [];
}

/**
 * options and data of a chart.
 * See chartjs for further details.
 *
 * @export
 * @interface ChartDefinition
 */
export interface ChartDefinition {
  options: any;
  data: ChartData;
}

interface ChartDataLocal {
  chartData: ChartDefinition;
  isDisplayed: boolean;
}

/**
 * Display a chart in a card with mutliple button which can rotate like a slide show.
 * Default card style is card-stats.
 *
 * @export
 * @class CardChartComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-card-chart',
  templateUrl: './card-chart.component.html',
  animations: [
    trigger('ChartFade', [
      transition('false => true', [
        group([
          query('.first-chart', [
            group([
              animate('1.5s ease-in', style({ opacity: '0' })),
            ]),
          ]),
          query('.second-chart', [
            style({ opacity: '0' }),
            group([
              animate('1.5s ease-in', style({ opacity: '1' })),
            ]),
          ]),
        ]),
      ]),
      transition('true => false', [
        group([
          query('.first-chart', [
            style({ opacity: '0' }),
            group([
              animate('1.5s ease-in', style({ opacity: '1' })),
            ]),
          ]),
          query('.second-chart', [
            group([
              animate('1.5s ease-in', style({ opacity: '0' })),
            ]),
          ]),
        ]),
      ]),
    ]),
  ],
})

export class CardChartComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * type the chart: line, bar, pie according to Chartjs
   *
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public chartType: string;
  /**
   *
   * Gives the list of buttons to be displayed and associate to each button the chart data (options + data) according to Chartjs
   * @type {ChartButton[]}
   * @memberof CardChartComponent
   */
  @Input() public chartButtons: ChartButton[];
  /**
   * Start rotation of charts directly after loading
   *
   * @memberof CardChartComponent
   */
  @Input() public autoRotateAtStart = true;

  /**
   * material design icon name
   *
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public cardIcon: string;
  /**
   *
   * Title text of the card on top right corner.
   * It can be a reference to i18n entry.
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public cardTitle: string;
  /**
   *
   * Footer text of the card.
   * * It can be a reference to i18n entry.
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public cardFooter?: string;

  /**
   *
   * interval in ms between rotation of chart within the card
   * @type {number}
   * @memberof CardChartComponent
   */
  @Input() public rotationInterval?: number;

  /**
   *
   * Additional class card.
   * It can be used to change the card style
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public cardClass?: string;
  /**
   *
   * Additional header class
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public headerClass?: string;
  /**
   *
   * Additional title class
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public titleClass?: string;
  /**
   *
   * Additional category class
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public categoryClass?: string;
  /**
   *
   * Additional body class
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public bodyClass?: string;
  /**
   * Additional footer class
   *
   * @type {string}
   * @memberof CardChartComponent
   */
  @Input() public footerClass?: string;

  /**
   * Event emitted when the rotation changed to another chart
   *
   * @memberof CardChartComponent
   */
  @Output() public activeButtonChanged = new EventEmitter<ChartButton>();

  /**
   * indicate if rotation is paused or not
   *
   * @type {boolean}
   * @memberof CardChartComponent
   */
  public isPaused: boolean;

  /**
   * reference to the set interval
   *
   * @memberof CardChartComponent
   */
  public rotationIntervalReference;

  /**
   * Curretn active button in the card
   *
   * @type {ChartButton}
   * @memberof CardChartComponent
   */
  public chartActiveButton: ChartButton;

  public isInitialized = false;

  /**
   * Chart data used in the first DOM chart element
   *
   * @type {ChartDataLocal}
   * @memberof CardChartComponent
   */
  public firstChart: ChartDataLocal = {
    chartData: { options: [], data: { datasets: [], labels: [] } },
    isDisplayed: true,
  };
  /**
   * Chart data used in the second DOM chart element
   *
   * @memberof CardChartComponent
   */
  public secondChart = {
    chartData: { options: [], data: { datasets: [], labels: [] } },
    isDisplayed: false,
  };

  /**
   * Indicate in which direction the change occur
   * If true the animation wil go from first to second DOM element
   * If false the animation wil go from second to first DOM element
   * @memberof CardChartComponent
   */
  public changeFromFirstToSecond = false;

  /**
   * Indicate that an animation is on-going
   * used tp disable buttons of teh chart to avoid conflicting update
   *
   * @memberof CardChartComponent
   */
  public animationOngoing = false;

  public ngOnInit(): void {
    this.chartActiveButton = this.chartButtons[0];
    // Initialization is done only in case data exist linked to a button
    if (this.chartButtons[0].chart) {
      this.isInitialized = true;
    }
  }

  public ngAfterViewInit(): void {
    this.isPaused = true;
    // Start automatic rotation
    if (this.autoRotateAtStart) {
      this.startRotation(this.chartButtons[0]);
    }
    // Initialization is done only in case data exist linked to a button
    if (this.chartButtons[0].chart) {
      this.isInitialized = true;
    }
  }

  public ngOnDestroy(): void {
    this.pauseRotation();
  }

  /**
   * Used to refresh data from parent component
   *
   * @param {ChartButton[]} chartButtons
   * @memberof CardChartComponent
   */
  public setData(chartButtons: ChartButton[]) {
    this.isInitialized = true;
    this.chartButtons = chartButtons;
    // refresh active button data and graph data
    this.chartActiveButton = this.chartButtons.find((button) => button.name === this.chartActiveButton.name);
    this.setChartData(this.chartActiveButton.chart, true);
  }

  public pauseRotation() {
    if (!this.isPaused) {
      clearInterval(this.rotationIntervalReference);
      this.rotationIntervalReference = null;
      this.isPaused = true;
    }
  }

  /**
   * Start the rotation of the charts
   *
   * @param {ChartButton} [startingButton] Define the starting button to use when rotation start
   * @memberof CardChartComponent
   */
  public startRotation(startingButton?: ChartButton) {
    if (this.isPaused) {
      if (startingButton) {
        this.nextChart(startingButton.name);
      }
      this.rotationIntervalReference = setInterval(() => this.nextChart(),
        (this.rotationInterval ? this.rotationInterval : DEFAULT_CHART_INTERVAL));
      this.isPaused = false;
    }
  }

  /**
   * Move to next chart except if chartName is provided
   * When chartName is provided, it is considered as a manual action so no animation is done
   * @param {*} [chartName=null] name of teh chart button to display
   * @memberof CardChartComponent
   */
  public nextChart(chartName = null) {
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

  /**
   * Animation done event for ChartFade
   *
   * @param {AnimationEvent} [event]
   * @memberof CardChartComponent
   */
  public chartFadeOutComplete(event?: AnimationEvent) {
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

}
