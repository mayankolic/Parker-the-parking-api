const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        ownerName: "String",
        vehicleType: "String",
        vehicleNumber: "String",
        exitTime: "String",
        cost:"number"
    },
    { timestamps: true }
);

const DispatchedVehicles= mongoose.model("DispatchedVehicles", schema);
module.exports = DispatchedVehicles;