import Accessor from "@arcgis/core/core/Accessor";
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import { Polyline } from "@arcgis/core/geometry";
import * as jsonUtils from "@arcgis/core/renderers/support/jsonUtils";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Field from "@arcgis/core/layers/support/Field";
import PolylineSections from "./PolylineSections";

type SourceLayerType = FeatureLayer | GeoJSONLayer;

const LINE_OBJECT_ID_FIELD = "_line_objectid";

const createAnimationLayer = (layer: SourceLayerType) => {
  let renderer = layer.renderer;
  if (renderer) {
    renderer = jsonUtils.fromJSON(renderer.toJSON());
  }

  let elevationInfo: any = layer.elevationInfo;

  // Try to invoke internal clone()
  if (elevationInfo && typeof elevationInfo.clone === "function") {
    elevationInfo = elevationInfo.clone();
  }

  const fields = [
    new Field({
      name: "OBJECTID",
      type: "oid",
    }),
    new Field({
      name: LINE_OBJECT_ID_FIELD,
      type: "long",
    }),
  ];

  layer.fields.forEach((field) => {
    if (field.type !== "oid" && field.name !== "OBJECTID" && field.name !== LINE_OBJECT_ID_FIELD) {
      fields.push(field);
    }
  });

  return new FeatureLayer({
    elevationInfo,
    fields,
    geometryType: "polyline",
    labelingInfo: layer.labelingInfo
      ? layer.labelingInfo.map((info) => info.clone())
      : (undefined as any),
    labelsVisible: layer.labelsVisible,
    legendEnabled: layer.legendEnabled,
    listMode: layer.listMode,
    maxScale: layer.maxScale,
    minScale: layer.maxScale,
    objectIdField: "OBJECTID",
    opacity: layer.opacity,
    outFields: ["*"],
    popupEnabled: layer.popupEnabled,
    popupTemplate: layer.popupTemplate ? layer.popupTemplate.clone() : (undefined as any),
    renderer,
    source: [],
    spatialReference: layer.spatialReference,
    title: layer.title,
  });
};

export default class LineLayerAnimation {
  constructor(private _sourceLayer: SourceLayerType) {
    this.initializeAnimationLayer();
  }

  get sourceLayer(): SourceLayerType {
    return this._sourceLayer;
  }

  private resolveAnimationLayer: (animationLayer: FeatureLayer) => any = null as any;
  private rejectAnimationLayer: (error: any) => any = null as any;

  private animationGraphics = new Map<number, Graphic>();
  private sections = new Map<number, PolylineSections>();

  private animationLayerPromise: IPromise<FeatureLayer> = promiseUtils.create((resolve, reject) => {
    this.resolveAnimationLayer = resolve;
    this.rejectAnimationLayer = reject;
  });

  private seekGraphicDebounce = promiseUtils.debounce((progress: number, objectId: number) =>
    this.seekGraphicSequencial(progress, objectId)
  );

  public getLineGraphic(animatedGraphic: Graphic): IPromise<Graphic> {
    const objectId = animatedGraphic.attributes[LINE_OBJECT_ID_FIELD];
    return this.queryLineGraphic(objectId);
  }

  public whenAnimatedLayer(): IPromise<FeatureLayer> {
    return this.animationLayerPromise;
  }

  public async seek(progress: number, objectId: number) {
    return this.seekGraphicDebounce(progress, objectId);
  }

  private async seekGraphicSequencial(progress: number, objectId: number) {
    const graphic = await this.getAnimationGraphic(objectId);

    const edits: {
      addFeatures: Graphic[];
      updateFeatures: Graphic[];
    } = {
      addFeatures: [],
      updateFeatures: [],
    };

    let sections = this.sections.get(objectId);
    if (sections) {
      edits.updateFeatures = [graphic];
    } else {
      sections = new PolylineSections(graphic.geometry as Polyline);
      this.sections.set(objectId, sections);
      edits.addFeatures = [graphic];
    }

    const geometry = sections.createPolyline(progress);
    graphic.geometry = geometry;
    return this.whenAnimatedLayer().then((layer) => {
      layer.applyEdits(edits);
    });
  }

  private queryLineGraphic = (objectId: number): IPromise<Graphic> => {
    const layer = this.sourceLayer;
    if (!layer) {
      return promiseUtils.reject("No source layer assigned");
    }

    return layer
      .queryFeatures({
        objectIds: [objectId],
        outFields: ["*"],
        returnGeometry: true,
      })
      .then((featureSet): Graphic => {
        if (featureSet.features.length) {
          return featureSet.features[0];
        }
        throw new Error("No such graphic with objectId `{objectId}`");
      });
  };

  private getAnimationGraphic = (objectId: number): IPromise<Graphic> => {
    if (this.animationGraphics.has(objectId)) {
      return promiseUtils.resolve(this.animationGraphics.get(objectId));
    } else {
      return this.queryLineGraphic(objectId)
        .then((lineGraphic) => lineGraphic.clone())
        .then((animationGraphic) => {
          const lineObjectId = animationGraphic.attributes[this.sourceLayer.objectIdField];
          animationGraphic.attributes[LINE_OBJECT_ID_FIELD] = lineObjectId;
          this.animationGraphics.set(objectId, animationGraphic);
          return animationGraphic;
        });
    }
  };

  private initializeAnimationLayer = async () => {
    const layer = this.sourceLayer;
    await layer.load();

    if (layer.geometryType !== "polyline") {
      const error = new Error('`lineLayer` must have `geometryType` "polyline"');
      this.rejectAnimationLayer(error);
      throw error;
    }

    const animationLayer = createAnimationLayer(layer);
    this.resolveAnimationLayer(animationLayer);
  };
}
