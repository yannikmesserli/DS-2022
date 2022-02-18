// @ts-check
import ClassBreaksRenderer from "esri/renderers/ClassBreaksRenderer.js";
import appConfig from "../helpers/config.js";

export function applyYearRenderer (layer) {
  const classBreakInfos = appConfig.yearClasses.map(function (element) {
    return {
      minValue: element.minYear,
      maxValue: element.maxYear,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{
          type: "fill",
          material: {
            color: element.color,
            colorMixMode: "replace"
          },
          edges: {
            type: "solid",
            color: [50, 50, 50, 0.5]
          }
        }]
      }
    }
  })

  layer.renderer = new ClassBreaksRenderer({
    field: appConfig.yearField,
    defaultSymbol: {
      type: "mesh-3d",
      symbolLayers: [{
        type: "fill",
        material: {
          color: appConfig.noDataColor,
          colorMixMode: "replace"
        },
        edges: {
          type: "solid",
          color: [50, 50, 50, 0.5]
        }
      }]
    },
    classBreakInfos: classBreakInfos
  });
}

export function applySolarAreaRenderer(layer) {
  layer.renderer = {
    type: "simple",
    symbol: {
      type: "mesh-3d",
      symbolLayers: [{
        type: "fill",
        material: { color: appConfig.noDataColor, colorMixMode: "replace" },
        edges: {
          type: "solid",
          color: [50, 50, 50, 0.5]
        }
      }]
    },
    visualVariables: [{
      type: "color",
      field: appConfig.solarAreaField,
      legendOptions: {
        title: "Solar-Suitable Area (m<sup>2</sup>)"
      },
      stops: appConfig.solarAreaVariable.stops
    }]
  }
}

export function applyUsageRenderer(layer) {
  const uniqueValueInfos = appConfig.usageValues.map(function (element) {
    return {
      value: element.value,
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{
          type: "fill",
          material: { color: element.color, colorMixMode: "replace" },
          edges: {
            type: "solid",
            color: [50, 50, 50, 0.5]
          }
        }]
      },
      label: element.label
    }
  });

  layer.renderer = {
    type: "unique-value",
    field: appConfig.usageField,
    defaultSymbol: {
      type: "mesh-3d",
      symbolLayers: [{
        type: "fill",
        material: { color: appConfig.otherColor, colorMixMode: "replace" },
        edges: {
          type: "solid",
          color: [50, 50, 50, 0.5]
        }
      }]
    },
    uniqueValueInfos: uniqueValueInfos
  }
}

export function applyOriginalTexture(layer) {
  layer.renderer = {
    type: "simple",
    symbol: {
      type: "mesh-3d",
      symbolLayers: [{
        type: "fill",
        material: null
      }]
    }
  }
}
