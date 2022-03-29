const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        ownerName: "String",
        vehicleType: "String",
        vehicleNumber: "String",
        entryTime: "String"
    },
    { timestamps: true }
);

const ParkedVehicles = mongoose.model("ParkedVehicles", schema);
module.exports = ParkedVehicles;