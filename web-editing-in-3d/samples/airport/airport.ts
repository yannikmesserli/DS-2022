import Collection from "@arcgis/core/core/Collection";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-button";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onFragment, onPlayClick, setHeader } from "../../../common/utils";

const GOTO_DURATION = 1000;

const view = ((window as any)["view"] = initView(SAMEDAN_AIRPORT));

const widget = document.createElement("div");
widget.className = "esri-widget";
widget.style.display = "flex";
widget.style.flexDirection = "column";
widget.style.gap = "10px";
widget.style.padding = "10px";
view.ui.add(widget, "top-right");

const treeSymbolPromise = new WebStyleSymbol({
  name: "Larix",
  styleName: "EsriRealisticTreesStyle",
}).fetchSymbol();

const airplaneSymbolPromise = new WebStyleSymbol({
  name: "Airplane_Propeller",
  styleName: "EsriRealisticTransportationStyle",
}).fetchSymbol();

const antennaSymbolPromise = new WebStyleSymbol({
  name: "Cell_Phone_Antenna",
  styleName: "EsriInfrastructureStyle",
}).fetchSymbol();

const terminalSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: 5,
      material: { color: [255, 255, 255, 1] },
    }),
  ],
});

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

onFragment("init", async () => {
  setHeader("Placing trees on the ground");
  resetWidget();
});

onFragment("on-the-ground", async () => {
  setHeader("Placing trees on the ground");
  resetWidget();

  onPlayClick("on-the-ground", () => {
    widget.innerHTML = "";
    addTreeButton();
  });

  await view.when();
  view.goTo(
    {
      position: {
        spatialReference: SpatialReference.WebMercator,
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

onFragment("relative-to-ground", async () => {
  setHeader("Placing airplanes in the air");
  widget.innerHTML = "";

  addTreeButton();
  onPlayClick("relative-to-ground", addAirplaneButton);

  await view.when();
  view.goTo(
    {
      position: {
        spatialReference: SpatialReference.WebMercator,
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

onFragment("relative-to-scene", async () => {
  setHeader("Placing antennas relative to the scene");
  widget.innerHTML = "";

  addTreeButton();
  addAirplaneButton();
  onPlayClick("relative-to-scene", addAntennaButton);

  await view.when();
  view.goTo(
    {
      position: {
        spatialReference: SpatialReference.WebMercator,
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

onFragment("polygons", async () => {
  setHeader("Sketching a new terminal");
  widget.innerHTML = "";

  addTreeButton();
  addAirplaneButton();
  addAntennaButton();
  onPlayClick("polygons", addTerminalButton);

  await view.when();
  view.goTo(
    {
      position: {
        spatialReference: SpatialReference.WebMercator,
        x: 1099908.0674983682,
        y: 5865746.7213742165,
        z: 1933.7259117281064,
      },
      heading: 300.36268172986865,
      tilt: 25.490546411744187,
    },
    { duration: GOTO_DURATION }
  );
});

async function addTreeButton() {
  const trees = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
  view.map.add(trees);

  addButton("Add tree", async () => {
    svm.layer = trees;
    svm.pointSymbol = await treeSymbolPromise;
    svm.create("point");
  });
}

async function addAirplaneButton() {
  const airplanes = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  view.map.add(airplanes);

  addButton("Add airplane", async () => {
    svm.layer = airplanes;
    svm.pointSymbol = await airplaneSymbolPromise;
    svm.create("point");
  });
}

async function addAntennaButton() {
  const antennas = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
  view.map.add(antennas);

  addButton("Add antenna", async () => {
    svm.layer = antennas;
    svm.pointSymbol = await antennaSymbolPromise;
    svm.create("point");
  });
}

function addTerminalButton() {
  const terminals = new GraphicsLayer({ elevationInfo: { mode: "absolute-height" } });
  view.map.add(terminals);

  svm.snappingOptions.enabled = true;
  svm.snappingOptions.featureSources = new Collection([{ layer: terminals } as any]);

  addButton("Add terminal", async () => {
    svm.layer = terminals;
    svm.polygonSymbol = terminalSymbol;
    svm.create("polygon");
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

function resetWidget(): void {
  widget.textContent = "No buttons";
}
