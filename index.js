const express = require("express");
const axios = require('axios');
// const { url } = require('./ports');
const { ConnectionPoolClosedEvent } = require("mongodb");
const moment = require('moment');
const mongoose = require('mongoose');
const app = express();
const ParkedVehicles = require('./ParkedVehicles');
const DispatchedVehicles = require('./DispatchedVehicles');
const res = require("express/lib/response");
const port = process.env.PORT || 3000;
const CONNECTION_URL = "mongodb://parker-010:parker-010@cluster0-shard-00-00.qrrnc.mongodb.net:27017,cluster0-shard-00-01.qrrnc.mongodb.net:27017,cluster0-shard-00-02.qrrnc.mongodb.net:27017/ParkingData?ssl=true&replicaSet=atlas-gl57w1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(port, () => console.log(`Server Running on Port: http://localhost:${port}`)))
    .catch((error) => console.log(`${error} did not connect`));
let dispatch = [];
function getDayDiff(entryDateAndTime, exitDateAndTime) {
    const entryMilliSeconds = entryDateAndTime.getTime();
    const exitMilliSeconds = exitDateAndTime.getTime();
    console.log(entryMilliSeconds);
    console.log(exitMilliSeconds);
    const duration = Math.abs(exitMilliSeconds - entryMilliSeconds);
    const hours = Math.floor((duration / (1000 * 60 * 60)));
    return hours;
}
function getCost(timeSpent, typeOfVehicle) {
    if (typeOfVehicle.toUpperCase() === 'CAR') {
        return timeSpent * 20;
    }
    else if (typeOfVehicle.toUpperCase() === 'BIKE') {
        return timeSpent * 10;
    }
    else if (typeOfVehicle.toUpperCase() === 'AUTO') {
        return timeSpent * 15;
    }
    else {
        return timeSpent * 5;
    }
}
app.post("/", async (req, res) => {
    const ownerName = "kjhgfd";
    const vehicleType = "bike";
    const vehicleNumber = "12345678915";
    try {
        const newParkedVehicle = await ParkedVehicles.create({
            ownerName,
            vehicleType,
            vehicleNumber
        });
        res.json(newParkedVehicle);
    } catch (e) {
        res.status(500).send(e);
    }
});
app.get('/', async (req, res) => {
    try {
        const vehicles = await ParkedVehicles.find();
        res.json(vehicles);
    } catch (e) {
        console.log(e);
    }
});
app.get('/home', async (req, res) => {
    try {
        const parkedVaahan = await ParkedVehicles.find();
        const dispatchedVaahan = await DispatchedVehicles.find();
        res.json({ status: 'ok', ParkedVehiclesLength: parkedVaahan.length, DispatchedVehicles: dispatchedVaahan.length });
    } catch (e) {
        console.log(e);
    }
});


app.get('/parkedVehicles', async (req, res) => {
    try {
        const parkedVaahan = await ParkedVehicles.find();
        res.json({ status: "ok", data: parkedVaahan });
    } catch (e) {
        throw new Error("Gaand fatt gayi behnchod");
    }
})
app.get('/dispatchedVehicles', async (req, res) => {
    try {
        const dispatchedVaahan = await DispatchedVehicles.find();
        res.json({ status: "ok", data: dispatchedVaahan });
    } catch (e) {
        throw new Error("Le bete ja Maa chuda!!")
    }
});
app.get('/:vehicleNumber', async (req, res) => {

    const number = req.params.vehicleNumber;
    try {
        var data = await ParkedVehicles.findOne({ vehicleNumber: number });
        console.log(data);
        
        const entryDateAndTime = data.createdAt;
        const exitDateAndTime = new Date();
        const chargedDays = getDayDiff(entryDateAndTime, exitDateAndTime);
        let charge = getCost(chargedDays, data.vehicleType);
        // console.log(typeof charge);
        let id = data._id;
        await ParkedVehicles.deleteOne({ _id: id });
        const ownerName = data.ownerName;
        const vehicleType = data.vehicleType;
        const vehicleNumber = await data.vehicleNumber;
        const entryTime = (data.createdAt);
        const exitTime = exitDateAndTime;
        console.log(typeof entryTime);
        console.log(typeof exitTime);
        console.log(data);
        // console.log(vehicleType);
        // console.log("-----------------------------------------");
        const newDispatchedVehicles = await DispatchedVehicles.create({
            ownerName,
            vehicleType,
            vehicleNumber,
            entryTime,
            exitTime,
            charge
        });
        console.log("------------------------------");
        res.json({ newDispatchedVehicles });
        // res.redirect('/home');
    } catch (e) {
        res.json({ status: "error", message: e });
    }
})
