import Polygon from "@arcgis/core/geometry/Polygon";
import SceneModification from "@arcgis/core/layers/support/SceneModification";

const storageKey = "customized-editing-state";

class State {
  private _modification: SceneModification | null = null;
  private _floors: Polygon[] = [];

  constructor() {
    this._load();
  }

  get modification(): SceneModification | null {
    return this._modification;
  }

  set modification(value: SceneModification | null) {
    this._modification = value;
    this._save();
  }

  get floors(): readonly Polygon[] {
    return this._floors;
  }

  set floors(value: readonly Polygon[]) {
    this._floors = value.slice();
    this._save();
  }

  private _load(): void {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored);

    this._modification = parsed.modification
      ? SceneModification.fromJSON(parsed.modification)
      : null;

    this._floors = parsed.floors ? parsed.floors.map((floor: any) => Polygon.fromJSON(floor)) : [];
  }

  private _save(): void {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        modification: this._modification?.toJSON() ?? null,
        floors: this._floors.map((floor) => floor.toJSON()),
      })
    );
  }
}

export const state = new State();
