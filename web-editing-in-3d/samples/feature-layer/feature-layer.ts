import Camera from "@arcgis/core/Camera";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import RotationVariable from "@arcgis/core/renderers/visualVariables/RotationVariable";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import { PointSymbol3D } from "@arcgis/core/symbols";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SceneView from "@arcgis/core/views/SceneView";
import Editor from "@arcgis/core/widgets/Editor";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

let view: SceneView;
let aircraftLayer: FeatureLayer | null = null;
let renderer: UniqueValueRenderer | null = null;
let editor: Editor | null = null;

(async (): Promise<void> => {
  const camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099838.309838232,
      y: 5865770.443455763,
      z: 1771.2705388450995,
    },
    heading: 327.12912283465096,
    tilt: 46.776661717554724,
  });

  view = initView(SAMEDAN_AIRPORT, camera);

  aircraftLayer = await createAircraftLayer();
  view.map.add(aircraftLayer);

  onPlayClick("editor-widget", initEditor);
  onPlayClick("visual-variables-rotation", setRotationVisualVariable);
  onPlayClick("layer-infos", setLayerInfos);
})();

function initEditor(): void {
  if (editor) {
    editor?.destroy();
  }

  editor = new Editor({ view });
  view.ui.add(editor, "top-right");
}

function setRotationVisualVariable(): void {
  if (!aircraftLayer || !renderer) {
    return;
  }

  // We need to create a copy of the renderer. We'll modify it and then apply
  // it to our layer. If we don't create a copy, our changes may not be picked
  // up by the layer.
  const newRenderer = renderer.clone();

  newRenderer.visualVariables = [
    // Only allow modifying the rotation in the view. Manipulators for size
    // won't be displayed.
    new RotationVariable({
      field: "ROTATION",
      rotationType: "geographic",
    }),
  ];

  aircraftLayer.renderer = newRenderer;

  initEditor();
}

function setLayerInfos(): void {
  if (!editor || !aircraftLayer) {
    return;
  }

  editor.layerInfos = [
    {
      layer: aircraftLayer,
      formTemplate: new FormTemplate({
        elements: [
          // Only display a field for rotation, but not for size.
          new FieldElement({
            fieldName: "ROTATION",
            label: "Rotation",
          }),
        ],
      }),
    },
  ];

  // Existing forms don't update so we need to cancel any current workflow.
  editor.cancelWorkflow();
}

async function createAircraftLayer(): Promise<FeatureLayer> {
  const [airplaneSymbol, helicopterSymbol] = await loadSymbols();

  renderer = new UniqueValueRenderer({
    field: "TYPE",
    uniqueValueInfos: [
      { value: "1", label: "Helicopter", symbol: helicopterSymbol },
      { value: "2", label: "Airplane", symbol: airplaneSymbol },
    ],
    visualVariables: [
      new SizeVariable({
        axis: "height",
        field: "SIZE",
        valueUnit: "meters",
      }),
      new RotationVariable({
        field: "ROTATION",
        rotationType: "geographic",
      }),
    ],
  });

  return new FeatureLayer({
    title: "Airplanes",
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/EditableFeatures3D/FeatureServer/3",
    elevationInfo: { mode: "absolute-height" },
    outFields: ["*"],
    renderer,
  });
}

async function loadSymbols(): Promise<PointSymbol3D[]> {
  return Promise.all(
    [
      new WebStyleSymbol({
        name: "Airplane_Propeller",
        styleName: "EsriRealisticTransportationStyle",
      }),
      new WebStyleSymbol({
        name: "Eurocopter_AS-365_-_Flying",
        styleName: "EsriRealisticTransportationStyle",
      }),
    ].map((style) => style.fetchSymbol())
  );
}
