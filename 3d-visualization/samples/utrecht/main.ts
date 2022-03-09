import Camera from "@arcgis/core/Camera";
import { SpatialReference } from "@arcgis/core/geometry";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import { addOAuthSupport } from "../../../common/utils";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import LayerList from "@arcgis/core/widgets/LayerList";
import Slice from "@arcgis/core/widgets/Slice";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { UniqueValueRenderer } from "@arcgis/core/renderers";
import { ExtrudeSymbol3DLayer, FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import Editor from "@arcgis/core/widgets/Editor";
import Legend from "@arcgis/core/widgets/Legend";
import Daylight from "@arcgis/core/widgets/Daylight";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

addOAuthSupport();

// DEMO STEP 1
const elevationInfo: __esri.FeatureLayerElevationInfo = {
  // mode: "on-the-ground"

  mode: "absolute-height",

  // featureExpressionInfo: {
  //   expression: "$feature.FloorHeight * $feature.Level_"
  // }
}

// DEMO STEP 2

function createFloorSymbol(r: number, g: number, b: number) {
  return new PolygonSymbol3D({
    symbolLayers: [
      // new FillSymbol3DLayer({
      //   material: {
      //     color: [r, g, b]
      //   },
      //   outline: {
      //     size: 1,
      //     color: [0, 0, 0, 0.75]
      //   }
      // })
      new ExtrudeSymbol3DLayer({
        size: 1,
        material: {
          color: [r, g, b, 0.65]
        },
        edges: new SolidEdges3D({
          color: [0, 0, 0, 0.5],
          size: 1
        })
      })
    ]
  });
}

// DEMO STEP 3

function createFloorRenderer() {
  return new UniqueValueRenderer({

    // visualVariables: [
    //   new SizeVariable({
    //     // field: "FloorHeight",
    //     valueExpression: "$feature.FloorHeight - 0.5",
    //     valueUnit: "meters"
    //   })
    // ],

    field: "SpaceUse",
    uniqueValueInfos: [{
        label: "Office",
        value: "Office",
        symbol: createFloorSymbol(115, 178, 255)
    },
    {
      label: "Hotel",
      value: "Hotel",
      symbol: createFloorSymbol(189, 126, 190)
    },
    {
      label: "MF Residential",
      value: "MF Residential",
      symbol: createFloorSymbol(255, 238, 101)
    },
    {
      label: "Retail",
      value: "Retail",
      symbol: createFloorSymbol(253, 127, 111)
    },
  ],
});
}

// DEMO STEP 4

const map = new WebScene({

  // basemap: "satellite",
  basemap: "topo-vector",

  ground: "world-elevation",
  
  layers: [
    // new IntegratedMeshLayer({
    //   title: "Utrecht Mesh",
    //   portalItem: {
    //     id: "df86969773c64a8e9dc6bdc4eec0bf99"
    //   },
    //   visible: false
    // })
  ]

});

const buildingDesyp = new FeatureLayer({
  title: "Utrecht Desyp",
  url: "https://services7.arcgis.com/wdgKFvvZvYZ3Biji/arcgis/rest/services/Utrecht_desyp_demo/FeatureServer/11",
  renderer: createFloorRenderer(),
  elevationInfo,
});

const buildingStadskantoor = new FeatureLayer({
  title: "Utrecht Desyp",
  url: "https://services7.arcgis.com/wdgKFvvZvYZ3Biji/arcgis/rest/services/Utrecht_stadskantoor_demo/FeatureServer/74",
  renderer: createFloorRenderer(),
  elevationInfo,
});

const buildings = new GroupLayer({
  title: "Floors",
  listMode: "hide-children",
  layers: [buildingStadskantoor, buildingDesyp]
});

map.add(buildings);

const view = new SceneView({

  // qualityProfile: "high",

  container: "viewDiv",
  camera: {
    position: {
      spatialReference: SpatialReference.WebMercator,
        x: 568741.0513003711,
        y: 6816984.923302174,
        z: 207.94242427963763
    },
    heading: 198.57470427134257,
    tilt: 61.81647310330174
  },
  map,
});

view.ui.add(new LayerList({
  view
}), "bottom-left");

// view.ui.add(new Slice({
//   view
// }), "top-right");

// view.ui.add(new Editor({
//   view
// }), "bottom-right");

buildingStadskantoor.legendEnabled = false;
view.ui.add(new Legend({
  view,
  // respectLayerVisibility: false
}), "bottom-right");

view.popup.autoOpenEnabled = true;
view.popup.defaultPopupTemplateEnabled = true;



(window as any)["view"] = view;
