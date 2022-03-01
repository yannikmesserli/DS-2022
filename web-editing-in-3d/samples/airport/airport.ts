// @ts-check
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-button";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onFragment } from "../../../common/utils";

const GOTO_DURATION = 1000;

const view = ((window as any)["view"] = initView(SAMEDAN_AIRPORT));

const widget = document.createElement("div");
widget.className = "esri-widget";
widget.style.display = "flex";
widget.style.flexDirection = "column";
widget.style.gap = "10px";
widget.style.padding = "10px";
view.ui.add(widget, "top-right");

const treeSymbol = new WebStyleSymbol({
  name: "Larix",
  styleName: "EsriRealisticTreesStyle",
}).fetchSymbol();

const airplaneSymbol = new WebStyleSymbol({
  name: "Airplane_Propeller",
  styleName: "EsriRealisticTransportationStyle",
}).fetchSymbol();

const antennaSymbol = new WebStyleSymbol({
  name: "Cell_Phone_Antenna",
  styleName: "EsriInfrastructureStyle",
}).fetchSymbol();

const svm = new SketchViewModel({
  view,
  defaultUpdateOptions: {
    enableRotation: true,
    enableScaling: true,
  },
});

svm.on("create", (event) => {
  if (event.state === "complete") {
    svm.update(event.graphic);
  }
});

onFragment("elevation-modes-on-the-ground", async () => {
  widget.innerHTML = "";
  await addTreeButton();

  await whenOnce(() => !view.updating);
  view.goTo(
    {
      position: {
        spatialReference: { latestWkid: 3857, wkid: 102100 },
        x: 1099614.6066905723,
        y: 5865416.055518731,
        z: 1781.0668945247307,
      },
      heading: 62.19499744535247,
      tilt: 82.65080245910049,
    },
    { duration: GOTO_DURATION }
  );
});

onFragment("elevation-modes-relative-to-ground", async () => {
  widget.innerHTML = "";
  await addTreeButton();
  await addAirplaneButton();

  await whenOnce(() => !view.updating);
  view.goTo(
    {
      position: {
        spatialReference: { latestWkid: 3857, wkid: 102100 },
        x: 1099838.309838232,
        y: 5865770.443455763,
        z: 1771.2705388450995,
      },
      heading: 327.12912283465096,
      tilt: 46.776661717554724,
    },
    { duration: GOTO_DURATION }
  );
});

onFragment("elevation-modes-relative-to-scene", async () => {
  widget.innerHTML = "";
  await addTreeButton();
  await addAirplaneButton();
  await addAntennaButton();

  await whenOnce(() => !view.updating);
  view.goTo(
    {
      position: {
        spatialReference: { latestWkid: 3857, wkid: 102100 },
        x: 1099820.528361645,
        y: 5865792.376922636,
        z: 1736.2411283198744,
      },
      heading: 320.6680886902018,
      tilt: 71.8256269429896,
    },
    { duration: GOTO_DURATION }
  );
});

async function addTreeButton(): Promise<void> {
  const trees = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
  view.map.add(trees);

  addButton("Add tree", async () => {
    svm.layer = trees;
    svm.pointSymbol = await treeSymbol;
    svm.create("point");
  });
}

async function addAirplaneButton(): Promise<void> {
  const airplanes = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  view.map.add(airplanes);

  addButton("Add airplane", async () => {
    svm.layer = airplanes;
    svm.pointSymbol = await airplaneSymbol;
    svm.create("point");
  });
}

async function addAntennaButton(): Promise<void> {
  const antennas = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
  view.map.add(antennas);

  addButton("Add antenna", async () => {
    svm.layer = antennas;
    svm.pointSymbol = await antennaSymbol;
    svm.create("point");
  });
}

function addButton(label: string, onClick: () => void): void {
  const addPlaneBtn = document.createElement("calcite-button");
  addPlaneBtn.textContent = label;
  addPlaneBtn.color = "blue";
  addPlaneBtn.onclick = () => {
    onClick();
  };

  widget.appendChild(addPlaneBtn);
}
