import Camera from "@arcgis/core/Camera";
import { SpatialReference } from "@arcgis/core/geometry";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";
import Map from "@arcgis/core/Map";
import { addOAuthSupport } from "../../../common/utils";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import LayerList from "@arcgis/core/widgets/LayerList";
import Slice from "@arcgis/core/widgets/Slice";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { SimpleRenderer, UniqueValueRenderer } from "@arcgis/core/renderers";
import { ExtrudeSymbol3DLayer, FillSymbol3DLayer, PolygonSymbol3D, WaterSymbol3DLayer } from "@arcgis/core/symbols";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import Editor from "@arcgis/core/widgets/Editor";
import Legend from "@arcgis/core/widgets/Legend";
import Daylight from "@arcgis/core/widgets/Daylight";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Expand from "@arcgis/core/widgets/Expand";
import Weather from "@arcgis/core/widgets/Weather";

// addOAuthSupport();

const cityLayer = new IntegratedMeshLayer({
  // portalItem: {
  //   id: "79c3563e42ee40ddb1b8c688eaf0dd2a"
  // },
  // elevationInfo: {
  //   mode: "absolute-height",
  //   offset: 46,
  // },

  portalItem: {
    id: "1f1941eafe3942c0b00bcccd5720eedf"
  },

  // url: "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/Buildings_Frankfurt_2021/SceneServer",
  // Frankfurt integrated mesh data provided by nFrames and Aerowest
  copyright: "nFrames - Aerowest",
  title: "Integrated Mesh Frankfurt",
});

const normalWaterLevel = new FeatureLayer(
  {
    title: "Normal",
    url: "https://services7.arcgis.com/wdgKFvvZvYZ3Biji/arcgis/rest/services/Frankfurt_water/FeatureServer/0",
    elevationInfo: {
      mode: "absolute-height",
      offset: 0.7
    },
    renderer: new SimpleRenderer({
      symbol: new PolygonSymbol3D({
        symbolLayers: [
          new WaterSymbol3DLayer({
            color: [100, 90, 76]
          })
        ]
      })
    })
  },
);

const floodWaterLevel = new FeatureLayer({
  title: "Flooded",
  opacity: 0.91,
  url: "https://services7.arcgis.com/wdgKFvvZvYZ3Biji/arcgis/rest/services/Frankfurt_100y_flooding_demo_WFL1/FeatureServer/1",
  elevationInfo: {
    mode: "absolute-height",
  },
  renderer: new SimpleRenderer({
    symbol: new PolygonSymbol3D({
      symbolLayers: [
        new WaterSymbol3DLayer({
          color: [100, 90, 76]
        })
      ]
    })
  }),
  visible: false,
});

const waterLevel = new GroupLayer({
  title: "Water level",
  visible: false,
  // visibilityMode: "exclusive",
  layers: [normalWaterLevel, floodWaterLevel]
})

// Create a new map
const map = new Map({
  basemap: "satellite",
  ground: "world-elevation",
  layers: [cityLayer, waterLevel]
});

// Create a new sceneView and set the weather to cloudy
const view = new SceneView({
  container: "viewDiv",

  map: map,
  camera: {
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 966656.222569399,
      y: 6464220.886886281,
      z: 150,
    },
    heading: 313.141756179622,
    tilt: 88.50567036168142,
  },
  // qualityProfile: "high",
  environment: {
    lighting: { waterReflectionEnabled: true },
    atmosphere: {
      quality: "high",
    },
    weather: { type: "cloudy", cloudCover: 0.3 },
  },
});

view.popup.autoOpenEnabled = true;
view.popup.defaultPopupTemplateEnabled = true;


view.ui.add(new LayerList({
  view
}), "bottom-left");


(window as any)["view"] = view;

view.on("click", (e) => {
  const p = view.toMap(e);
  console.log("z", p.z);
});


const weatherExpand = new Expand({
  view: view,
  content: new Weather({
    view: view,
  }),
  
  // expanded: true,
});


view.ui.add([weatherExpand], "top-right");

/*****************************************************************
 * STEP 4
 * Add the widgets' UI elements to the view: DAYLIGHT
 *****************************************************************/

const daylightExpand = new Expand({
  view: view,
  content: new Daylight({
    view: view,
  }),
  
});

view.ui.add([daylightExpand], "bottom-right");


