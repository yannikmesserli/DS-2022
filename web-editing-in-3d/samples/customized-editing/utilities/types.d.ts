declare namespace __esri {
  interface FeatureSnappingLayerSourceProperties {
    /**
     * The source layer used for snapping.
     *
     * [Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-interactive-snapping-FeatureSnappingLayerSource.html#layer)
     */
    layer?:
      | (FeatureLayerProperties & { type: "feature" })
      | (GraphicsLayerProperties & { type: "graphics" })
      | (GeoJSONLayerProperties & { type: "geojson" })
      | (CSVLayerProperties & { type: "csv" })
      | (WFSLayerProperties & { type: "wfs" });
  }
}
