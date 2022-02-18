// @ts-check

import Color from "esri/Color.js";
import appConfig from "../helpers/config.js";

function calculateSolarAreaBins() {
  const bins = [];
  const stops = appConfig.solarAreaVariable.stops;
  const binSize = appConfig.solarAreaVariable.binSize;
  for (let i = stops[stops.length - 1].value; i >= stops[0].value - binSize; i -= binSize) {
    const nextValue = i + binSize;
    let fieldName = `area_${i}_${nextValue}`;
    let label = `${i} - ${nextValue} \u33A1`;
    let statsField = `CASE WHEN (${appConfig.solarAreaField} < ${nextValue} AND ${appConfig.solarAreaField} >= ${i}) THEN 1 ELSE 0 END`;
    if (i < stops[0].value) {
      fieldName = `area_${stops[0].value}`;
      label = `< ${stops[0].value} \u33A1`;
      statsField = `CASE WHEN (${appConfig.solarAreaField} < ${stops[0].value}) THEN 1 ELSE 0 END`;
    }
    if (i === stops[stops.length - 1].value) {
      fieldName = `area_${i}`;
      label = `> ${i} \u33A1`;
      statsField = `CASE WHEN (${appConfig.solarAreaField} > ${i}) THEN 1 ELSE 0 END`;
    }
    bins.push({
      color: getColorFromValue(i, appConfig.solarAreaVariable.stops).toHex(),
      statsField: statsField,
      fieldName: fieldName,
      label: label
    })
  }
  return bins;
}
const solarAreaBins = calculateSolarAreaBins();

function getColorFromValue(value, stops) {
  let minStop = stops[0];
  let maxStop = stops[stops.length - 1];

  let minStopValue = minStop.value;
  let maxStopValue = maxStop.value;

  if (value < minStopValue) {
    return new Color(minStop.color);
  }

  if (value > maxStopValue) {
    return new Color(maxStop.color);
  }

  const exactMatches = stops.filter(function (stop) {
    return stop.value === value;
  });

  if (exactMatches.length > 0) {
    return new Color(exactMatches[0].color);
  }

  minStop = null;
  maxStop = null;
  stops.forEach(function (stop, i) {
    if (!minStop && !maxStop && stop.value >= value) {
      minStop = stops[i - 1];
      maxStop = stop;
    }
  });

  const weightedPosition = (value - minStop.value) / (maxStop.value - minStop.value);

  return Color.blendColors(new Color(minStop.color), new Color(maxStop.color), weightedPosition);
}

export default {
  solarAreaBins
}