// @ts-check

import TimeSlider from "esri/widgets/TimeSlider.js";
import appConfig from "../helpers/config.js";

export function createTimeSlider(view) {
  const start = new Date(appConfig.timeline.minYear, 0, 1);
  const end = new Date(appConfig.timeline.maxYear, 0, 1);
  const timeSlider = new TimeSlider({
    container: "timeContainer",
    view: view,
    mode: "cumulative-from-start",
    fullTimeExtent: {start, end},
    values: [end],
    playRate: 2000,
    stops: {
      interval: {
        value: appConfig.timeline.bin,
        unit: "years"
      },
      timeExtent: { start, end }
    }
  });
  return timeSlider;
}