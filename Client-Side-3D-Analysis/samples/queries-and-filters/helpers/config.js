export default {
  portalUrl: "http://jsapi.maps.arcgis.com/",
  itemId: "a350d4d2b71a40a6a95031d25da9535f",

  buildingLayerTitle: "Helsinki_buildings",

  addressField: "address",
  usageField: "usage",
  yearField: "yearCompleted",
  solarAreaField: "solarAreaSuitableM2",
  solarPotentialField: "solarElectricitGenPotYearlyKWh",

  timeline: {
    bin: 5,
    minYear: 1900,
    maxYear: 2020
  },

  noDataColor: "white",
  otherColor: "#FFB55A",

  yearClasses: [{
    minYear: 1500,
    maxYear: 1899,
    color: "#bd0026",
    label: "<1900"
  }, {
    minYear: 1900,
    maxYear: 1924,
    color: "#f03b20",
    label: "1900 - 1924"
  }, {
    minYear: 1925,
    maxYear: 1949,
    color: "#fd8d3c",
    label: "1925 - 1949"
  }, {
    minYear: 1950,
    maxYear: 1974,
    color: "#feb24c",
    label: "1951 - 1974"
  }, {
    minYear: 1975,
    maxYear: 1999,
    color: "#fed976",
    label: "1975 - 1999"
  }, {
    minYear: 2000,
    maxYear: 2020,
    color: "#ffffb2",
    label: "2000 - 2020"
  }],

  solarAreaVariable: {
    stops: [
      { value: 200, color: "#406f8a", label: "< 100 m<sup>2</sup>" },
      { value: 1000, color: "#ffe23b", label: "> 1000 m<sup>2</sup>" }
    ],
    binSize: 200
  },

  usageValues: [{
    value: "industrial",
    color: "#FD7F6F",
    label: "Industrial"
  }, {
    value: "residential",
    color: "#7EB0D5",
    label: "Residential"
  }, {
    value: "general or commercial",
    color: "#BD7EBE",
    label: "General or Commercial"
  }, {
    value: "other",
    color: "#B2E061",
    label: "Other"
  }]
};
