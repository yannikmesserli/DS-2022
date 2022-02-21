// @ts-check
import ElevationProfile from "esri/widgets/ElevationProfile.js";
import { MANHATTAN } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("elevation-profile", () => {
  view = initView(MANHATTAN);

  widget = new ElevationProfile({
    view,
    profiles: [
      {
        type: "ground",
        color: "#61d4a4",
        title: "Ground",
      },
      {
        type: "view",
        color: "#8f61d4",
        title: "Layers",
        exclude: [view.map.ground],
      },
    ],
  });

  view.ui.add(widget, "top-right");
});
