const express = require("express");
const { ConnectionPoolClosedEvent } = require("mongodb");
const mongoose = require('mongoose');
const app = express();
const ParkedVehicles = require('./ParkedVehicles');
const DispatchedVehicles = require('./DispatchedVehicles');
const port = process.env.PORT || 8080;
app.use(express.json({
  type: ['application/json', 'text/plain']
}));
const CONNECTION_URL = "mongodb://parker-010:parker-010@cluster0-shard-00-00.qrrnc.mongodb.net:27017,cluster0-shard-00-01.qrrnc.mongodb.net:27017,cluster0-shard-00-02.qrrnc.mongodb.net:27017/ParkingData?ssl=true&replicaSet=atlas-gl57w1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, () => console.log(`Server Running on Port: http://localhost:${port}`)))
  .catch((error) => console.log(`${error} did not connect`));

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
  } else if (typeOfVehicle.toUpperCase() === 'BIKE') {
    return timeSpent * 10;
  } else if (typeOfVehicle.toUpperCase() === 'AUTO') {
    return timeSpent * 15;
  } else {
    return timeSpent * 5;
  }
}
app.post("/", async (req, res) => {
  console.log(req.body);
  console.log("--------------------------------------------------");
  const ownerName = req.body.ownerName;
  const vehicleType = req.body.vehicleType;
  const vehicleNumber = req.body.vehicleNumber;
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

app.delete(('/:id'), async (req, res) => {
  try {
    const _id = req.params.id;
    console.log(_id);
    const delepar = await ParkedVehicles.findByIdAndDelete({
      _id: _id
    });
    if (!delepar) {
      res.status(404).send();
    } else {
      res.status(200).json({
        status: "ok",
        data: delepar
      });
    }
  } catch (e) {
    res.send(e);
  }
})

app.get('/parkedVehicles', async (req, res) => {
  try {
    const parkedVaahan = await ParkedVehicles.find();
    res.json({ status: "ok", data: parkedVaahan });
  } catch (e) {
    throw new Error("Error in Parked Vehicles Collection");
  }
})


app.get('/dispatchedVehicles', async (req, res) => {
  try {
    const dispatchedVaahan = await DispatchedVehicles.find();
    res.json({ status: "ok", data: dispatchedVaahan });
  } catch (e) {
    throw new Error("Error in Dispatched Vehicles Collection")
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
    let charge = await getCost(chargedDays, data.vehicleType);
    let id = data._id;
    await ParkedVehicles.deleteOne({ _id: id });
    const ownerName = data.ownerName;
    const vehicleType = data.vehicleType;
    const vehicleNumber = await data.vehicleNumber;
    const entryTime = (data.createdAt);
    const exitTime = exitDateAndTime;
    console.log(charge);
    const newDispatchedVehicles = await DispatchedVehicles.create({
      ownerName,
      vehicleType,
      vehicleNumber,
      entryTime,
      exitTime,
      charge
    });
    console.log(newDispatchedVehicles);
    res.json({ status: "ok", body: newDispatchedVehicles });
  } catch (e) {
    res.json({ status: "error", message: e });
  }
})