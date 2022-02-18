// @ts-check

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";

let view, layer;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "customizing-popups") {
  init();

  const doc = parent.document;
  doc.getElementById("popup-1").onclick = setPopupSimple;
  doc.getElementById("popup-2").onclick = setPopupComplex;
}

function init() {
  config.portalUrl = appConfig.portalUrl;

  view = new SceneView({
    map: new WebScene({
      portalItem: { id: appConfig.itemId },
      basemap: "topo",
      ground: {
        layers: [],
      },
    }),
    container: "viewDiv",
    qualityProfile: "high",
  });

  view.map.load().then(function () {
    layer = view.map.layers.find(function (l) {
      return l.title === appConfig.buildingLayerTitle;
    });
  });
}

function setPopupSimple() {
  view.when(function () {
    layer.popupTemplate = {
      title: `{${appConfig.addressField}}`,
      content: `This structure was built in {${appConfig.yearField}} and has a {${appConfig.usageField}} use.`,
    };
  });
}

function setPopupComplex() {
  view.when(function () {
    layer.popupTemplate = {
      title: `{${appConfig.addressField}}`,
      content: [
        {
          type: "text",
          text: `This structure was built in {${appConfig.yearField}} and has a {${appConfig.usageField}} use.`,
        },
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "solarAreaSuitableM2",
              label: "Area suitable for solar panels (m<sup>2</sup>)",
            },
            {
              fieldName: "solarElectricitGenPotYearlyKWh",
              label: "Yearly solar electricity potential (KWh)",
            },
          ],
        },
      ],
    };
  });
}
