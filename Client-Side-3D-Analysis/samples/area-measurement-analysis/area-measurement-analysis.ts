import AreaMeasurementAnalysis from "@arcgis/core/analysis/AreaMeasurementAnalysis";
import Polygon from "@arcgis/core/geometry/Polygon";
import { DENVER_PARCELS } from "../../../common/scenes";
import { initView, onFragment, onInit, throwIfAborted, throwIfNotAbortError } from "../../../common/utils";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager";

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

let alignToGround = false;

onInit("area-measurement-analysis", () => {
  const view = initView(DENVER_PARCELS);
  view.popup.autoOpenEnabled = false;

  let abortController: AbortController | null = null;

  view.on("click", async (e: __esri.ViewClickEvent) => {
    abortController?.abort();
    const { signal } = (abortController = new AbortController());

    try {
      const { results, ground } = await view.hitTest(e);
      throwIfAborted(signal);

      if (results.length === 0 || !ground) {
        return;
      }

      const geometry = (results[0].graphic.geometry as Polygon).clone();

      // Our polygon don't have elevation values because the parent `FeatureLayer`
      // uses `on-the-ground` elevation mode. Therefore, we need to modify all
      // the vertices to so their Z corresponds to the the absolute elevation of
      // the ground. Essentially, we manually align the geometry to the ground.
      if (alignToGround) {
        const groundZ = ground.mapPoint.z;
        geometry.rings = geometry.rings.map((ring) => {
          return ring.map(([x, y]) => [x, y, groundZ]);
        });
        geometry.hasZ = true;
      }

      const analysis = new AreaMeasurementAnalysis({ geometry });

      (view as any).analyses.removeAll();
      (view as any).analyses.add(analysis);
    } catch (e) {
      throwIfNotAbortError(e);
    }
  });
});

onFragment("align-to-ground", () => {
  alignToGround = true;
});
