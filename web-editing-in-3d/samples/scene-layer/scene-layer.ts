import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import Editor from "@arcgis/core/widgets/Editor";
import { SAN_FRANCISCO_EDITABLE } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

(async function init(): Promise<void> {
  const view = initView(SAN_FRANCISCO_EDITABLE);

  await view.when();
  const sceneLayer = view.map.layers.getItemAt(0) as __esri.SceneLayer;

  sceneLayer.renderer = new SimpleRenderer({
    symbol: new MeshSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: "#fefefe",
            colorMixMode: "replace",
          },
          edges: new SolidEdges3D({
            color: [255, 255, 255, 0.5],
            size: 1,
          }),
        }),
      ],
    }),
  });

  onPlayClick("add-widget", () => {
    const editor = new Editor({ view });
    view.ui.add(editor, "top-right");
  });
})();
