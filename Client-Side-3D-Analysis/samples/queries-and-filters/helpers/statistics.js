// @ts-check

import utils from "../helpers/utils.js";

function generateSolarAreaStatistics() {
  const solarBins = utils.solarAreaBins;
  
  return solarBins.map(function (element) {
    return {
      onStatisticField:
        element.statsField,
      outStatisticFieldName: element.fieldName,
      statisticType: "sum"
    }
  })
}
const solarAreaStatistics = generateSolarAreaStatistics();

export default {
  solarAreaStatistics
};