// @ts-check

import utils from "../helpers/utils.js";
import statistics from "../helpers/statistics.js";

Chart.defaults.global.defaultFontFamily = `"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif`;
Chart.defaults.global.defaultFontSize = 12;

function createSolarAreaChart() {
  const areaCanvas = document.getElementById("solarChart");
  const areaBins = utils.solarAreaBins;
  return new Chart(areaCanvas.getContext("2d"), {
    type: "horizontalBar",
    data: {
      labels: areaBins.map(function (element) { return element.label }),
      datasets: [
        {
          label: "Buildings with this area",
          backgroundColor: areaBins.map(function (element) { return element.color }),
          data: [0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
    },
    options: {
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Number of buildings by solar-suitable area"
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true,
              precision: 0
            }
          }
        ],
        yAxes: [
          {
            stacked: true
          }
        ]
      }
    }
  });
}
const solarAreaChart = createSolarAreaChart();

export default {
  updateSolarCharts(result) {
    const allStats = result.features[0].attributes;

    const areaValues = statistics.solarAreaStatistics.map(function (element) {
      return allStats[element.outStatisticFieldName]
    });
    solarAreaChart.data.datasets[0].data = areaValues;
    solarAreaChart.update();
  }
}
