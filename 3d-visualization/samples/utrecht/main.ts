import Camera from "@arcgis/core/Camera";
import { SpatialReference } from "@arcgis/core/geometry";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";
import Map from "@arcgis/core/Map";
import { SimpleRenderer } from "@arcgis/core/renderers";
import { SimpleLineSymbol } from "@arcgis/core/symbols";
import WebScene from "@arcgis/core/WebScene";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

IdentityManager.registerOAuthInfos([
  new OAuthInfo({
    appId: "R4c1ZqLwrZObbHAG",
    popup: true,
    popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
  }),
]);

(window as any).setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};


const map = new WebScene({
  portalItem: {
    id: "fb285ca68eba4279b7e5147a3283d5fd"
  }
});

const view = new SceneView({
  container: "viewDiv",
  map,
});

(window as any)["view"] = view;
