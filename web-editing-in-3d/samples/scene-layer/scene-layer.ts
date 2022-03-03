import Camera from "@arcgis/core/Camera";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import RotationVariable from "@arcgis/core/renderers/visualVariables/RotationVariable";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import Editor from "@arcgis/core/widgets/Editor";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView } from "../../../common/utils";

init();

async function init(): Promise<void> {
  const view = initView(SAMEDAN_AIRPORT);
  view.camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099838.309838232,
      y: 5865770.443455763,
      z: 1771.2705388450995,
    },
    heading: 327.12912283465096,
    tilt: 46.776661717554724,
  });

  const [airplaneSymbol, helicopterSymbol] = await Promise.all(
    [
      new WebStyleSymbol({ name: "Airplane_Propeller", styleName: "EsriRealisticTransportationStyle" }),
      new WebStyleSymbol({ name: "Eurocopter_AS-365_-_Flying", styleName: "EsriRealisticTransportationStyle" }),
    ].map((style) => style.fetchSymbol())
  );

  const pointLayer = new FeatureLayer({
    title: "Airplanes",
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/EditableFeatures3D/FeatureServer/3",
    elevationInfo: { mode: "absolute-height" },
    outFields: ["*"],
    renderer: new UniqueValueRenderer({
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
    }),
  });

  view.map.add(pointLayer);

  const formTemplate = new FormTemplate({
    elements: [
      new FieldElement({ fieldName: "ROTATION", label: "Rotation" }),
      new FieldElement({ fieldName: "SIZE", label: "Size" }),
    ],
  });

  const editor = new Editor({
    view,
    layerInfos: [{ layer: pointLayer, formTemplate }],
  });

  view.ui.add(editor, "top-right");
}
