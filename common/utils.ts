import Camera from "@arcgis/core/Camera";
import { when } from "@arcgis/core/core/reactiveUtils";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-alert";
import "@esri/calcite-components/dist/components/calcite-loader";

const Reveal = (parent as any).Reveal as RevealStatic;

export function initView(itemId?: string, camera?: Camera) {
  const container = document.getElementById("viewDiv") as HTMLDivElement;

  const view = new SceneView({
    container,
    map: itemId ? new WebScene({ portalItem: { id: itemId } }) : new WebScene({ basemap: "topo" }),
    camera,
    qualityProfile: "low",
    popup: { defaultPopupTemplateEnabled: false },
  });

  showSpinnerUntilLoaded(view);

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}

function showSpinnerUntilLoaded(view: SceneView): void {
  const container = view.container;

  container.classList.add("loading");

  const loader = container.appendChild(document.createElement("calcite-loader"));
  loader.type = "indeterminate";
  loader.active = true;

  when(
    () => !view.groundView.updating,
    () => {
      container.classList.remove("loading");
      loader.remove();
    },
    { once: true }
  );
}

export function onInit(title: string, cb: () => void) {
  if (getCurrentSlide().getAttribute("data-slideId") === title) {
    cb();
  }
}

export function onFragment(id: string, cb: () => void) {
  const run = () => {
    if (getCurrentFragmentId() === id) {
      cb();
    }
  };

  Reveal.addEventListener("fragmenthidden", run);
  Reveal.addEventListener("fragmentshown", run);
  run();
}

export function onPlayClick(name: string, cb: () => void): void {
  getCurrentSlide()
    .querySelector(`[data-fragment-id="${name}"] > .play`)
    ?.addEventListener("click", cb);
}

export function getCurrentSlide(): HTMLElement {
  return Reveal.getCurrentSlide() as HTMLElement;
}

export function getCurrentFragment(): HTMLElement | null {
  return getCurrentSlide().querySelector(".current-fragment") ?? null;
}

function getCurrentFragmentId(): string | null {
  return getCurrentFragment()?.getAttribute("data-fragment-id") ?? null;
}

export function setHeader(header: string, selector: string = ".header"): void {
  const headerElement = getCurrentSlide().querySelector(selector);
  if (!headerElement) {
    return;
  }

  headerElement.textContent = header;
}

export function showAlert(msg: string): void {
  const alertElement = document.createElement("calcite-alert");
  alertElement.active = true;

  const msgElement = alertElement.appendChild(document.createElement("div"));
  msgElement.slot = "message";
  msgElement.textContent = msg;

  document.body.appendChild(alertElement);
}

export function addOAuthSupport(): void {
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
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new Error("AbortError");
  }
}

export function throwIfNotAbortError(e: any): void {
  if (e?.message !== "AbortError") {
    throw e;
  }
}
