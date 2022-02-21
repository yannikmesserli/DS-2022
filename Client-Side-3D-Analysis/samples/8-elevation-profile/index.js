// @ts-check
import ElevationProfile from "esri/widgets/ElevationProfile.js";
import { SHADOW_CAST } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("elevation-profile", () => {
  view = initView(SHADOW_CAST);

  widget = new ElevationProfile({
    view,
    profiles: [
      {
        // displays elevation values from Map.ground
        type: "ground",
        color: "#61d4a4",
        title: "Ground elevation",
      },
      {
        // displays elevation values from a SceneView
        type: "view",
        color: "#8f61d4",
        title: "Layers",
        // by default ground and all layers are used to compute elevation, but
        // you can define which elements should be included/excluded from the computation
        exclude: [view.map.ground],
      },
    ],
  });

  view.ui.add(widget, "top-right");
});
