import { ClassBreaksRenderer } from "@arcgis/core/rasterRenderers";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import Editor from "@arcgis/core/widgets/Editor";
import { SAN_FRANCISCO_EDITABLE } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

(async function init(): Promise<void> {
  const view = initView(SAN_FRANCISCO_EDITABLE);

  await view.when();
  const sceneLayer = view.map.layers.getItemAt(0) as __esri.SceneLayer;

  sceneLayer.renderer = new ClassBreaksRenderer({
    visualVariables: [
      new ColorVariable({
        field: "yrbuilt",
        stops: [
          {
            color: [255, 105, 0, 255],
            value: 1900,
          },
          {
            color: [184, 77, 0, 255],
            value: 1950.9911,
          },
          {
            color: [145, 67, 11, 255],
            value: 2000.9822,
          },
          {
            color: [77, 65, 57, 255],
            value: 2050,
          },
        ],
      }),
    ],
    classBreakInfos: [
      {
        minValue: 0,
        maxValue: 2500,
        symbol: new MeshSymbol3D({
          symbolLayers: [
            new FillSymbol3DLayer({
              material: {
                color: [255, 255, 255, 1],
                colorMixMode: "replace",
              },
            }),
          ],
        }),
      },
    ],
    field: "yrbuilt",
  });

  onPlayClick("add-widget", () => {
    const editor = new Editor({ view });
    view.ui.add(editor, "top-right");
  });
})();
