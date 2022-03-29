const express = require("express");
const { ConnectionPoolClosedEvent } = require("mongodb");
const mongoose = require('mongoose');
const app = express();
const ParkedVehicles = require('./ParkedVehicles');
const DispatchedVehicles = require('./DispatchedVehicles');
const port = process.env.PORT || 3000;
const CONNECTION_URL = "mongodb://parker-010:parker-010@cluster0-shard-00-00.qrrnc.mongodb.net:27017,cluster0-shard-00-01.qrrnc.mongodb.net:27017,cluster0-shard-00-02.qrrnc.mongodb.net:27017/ParkingData?ssl=true&replicaSet=atlas-gl57w1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(port, () => console.log(`Server Running on Port: http://localhost:${port}`)))
    .catch((error) => console.log(`${error} did not connect`));


app.post("/", async (req, res) => {
    //this will add entry to the parkedvehicles
    const ownerName = req.params.ownerName;
    const vehicleType = req.params.vehicleType;
    const vehicleNumber = req.params.vehicleNumber;
    const entryTime = req.params.entryTime;
    try {
        const newParkedVehicle = await ParkedVehicles.create({
            ownerName,
            vehicleType,
            vehicleNumber,
            entryTime
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
app.get('/dispatchedvehicles', async (req, res) => {
    try {
        const dispatchedVaahan = await DispatchedVehicles.find();
        res.json({ status: "ok", data: dispatchedVaahan });
    }
    catch (e) {
        throw new Error("Le bete ja Maa chuda!!")
    }
});
app.delete('/:vehicleNumber', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const vehicletobedischarged = await ParkedVehicles.findBy({ vehicleNumber: id });
        await vehicletobedischarged.delete();
        res.json({ status: "ok", data: ParkedVehicles, by_id: vehicletobedischarged });
    }
    catch (err) {
        throw new error("KUch gadbad hai!!");
    }
})
