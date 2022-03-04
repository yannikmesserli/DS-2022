import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { MUNICH } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

IdentityManager.registerOAuthInfos([
  new OAuthInfo({
    appId: "pZzd4uJ0gZddupQh",
    popup: true,
    popupCallbackUrl: `${document.location.origin}/oauth-callback-api.html`,
  }),
]);

(window as any).setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};

const view = initView(MUNICH);

let widget: AreaMeasurement3D;

onPlayClick("add-widget", () => {
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});

onPlayClick("set-units", () => {
  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
