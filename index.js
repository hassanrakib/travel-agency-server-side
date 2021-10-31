const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT;



// middlewear
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5kcu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Database connection established...');
        const database = client.db("travel_agency");
        const tourPackagesCollection = database.collection("tour_packages");
        const ordersCollection = database.collection("orders");

        app.get('/tour-packages', async (req, res) => {
            const cursor = tourPackagesCollection.find({});
            const tourPackages = await cursor.toArray();
            res.json(tourPackages);
        })

        app.get('/place-order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await tourPackagesCollection.findOne(query);
            res.json(tourPackage);
        })

        app.post('/booking-confirm', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result.insertedId);
        })

        app.post('/new-package', async (req, res) => {
            const newPackage = req.body;
            const result = await tourPackagesCollection.insertOne(newPackage);
            res.send(result.insertedId);
        })

        app.get('/my-bookings/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })

        app.delete('/cancel-booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        app.get('/all-bookings', async (req, res) => {
            const cursor = ordersCollection.find({});
            const allBookings = await cursor.toArray();
            res.json(allBookings);
        })

        app.put('/update-booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedBooking = {
                $set: {
                    status: `Approved`
                },
            };
            const result = await ordersCollection.updateOne(filter, updatedBooking);
            res.json(result);
        })


    } finally {
        //   await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log('SERVER IS RUNNING...', port);
})