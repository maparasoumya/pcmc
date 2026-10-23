// Existing waste facilities from the PCMC CAP GIS workbook.
// Only Moshi has a concrete location in the workbook extract.
// Coordinates are a representative Moshi processing-site point from the supplied map prototype.
const wasteFacilities = [
  {
    siteName: "Moshi Integrated Waste Processing Site",
    location: "Moshi",
    coordinates: [18.658476578, 73.853205],

    facilities: [
      {
        name: "Material Recovery Facility",
        type: "Material Recovery Facility",
        capacityTPD: 1000
      },
      {
        name: "Waste to Energy",
        type: "Waste to Energy",
        capacityTPD: 600
      },
      {
        name: "Windrow Composting",
        type: "Composting",
        capacityTPD: 500
      }
    ]
  }
];

export default wasteFacilities;