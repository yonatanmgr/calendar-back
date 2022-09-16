const express = require('express')
const cors = require("cors")
const bodyParser = require("body-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()


app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000) 

const uri = "mongodb+srv://...@calendar.x0xgfz3.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect().then(
    client => {
        console.log("Connected")
        const eventCollection = client.db("calendar").collection("events")
        const userCollection = client.db("calendar").collection("users")
        const slotCollection = client.db("calendar").collection("slots")

        app.get('/events', (req, res) => {
            eventCollection.find().toArray()
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.get('/slots', (req, res) => {
            slotCollection.find().toArray()
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.get('/slots/:startTime', (req, res) => {
            slotCollection.findOne(req.params)
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.post('/slots/:startTime', (req, res) => {
            slotCollection.findOne(req.params, function(err, result){
                if (result == {}){
                    slotCollection.insertOne(req.body)
                }
                else{
                    slotCollection.updateOne(result, {$set: req.body})
                }
            })
        })

        app.post('/slotInDay', (req, res) => {
            eventCollection.findOne(req.body)
            .then(result => {
                res.send(result)
            })
            .catch(error => console.error(error))
        })

        app.get('/openEvents', (req, res) => {
            eventCollection.find({groupId: "workDay"}).toArray()
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.post('/events', (req, res) => {
            eventCollection.insertOne(req.body, function(err, result){
                if (err) throw err
                res.json(result);
            })
        })

        app.delete('/events', (req, res) => {
            eventCollection.deleteOne({"_id": ObjectId(req.body.extendedProps._id)})
                .then(response => { res.send(response) })
        })
        
        app.get('/users', (req, res) => {
            userCollection.find().toArray()
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.get('/users/:phone', (req, res) => {
            userCollection.findOne(req.params)
            .then(result => {
                if(result != null) {res.send(result)}
                else {res.send("none")}
            })
            .catch(error => console.error(error))
        })

        app.get('/users/:phone/events', (req, res) => {
            eventCollection.find({"extendedProps.user.phone": req.params.phone}).toArray()
            .then(result => {
                if(result != null) {res.send(result)}
                else {res.send([])}
            })
            .catch(error => console.error(error))
        })

        app.post('/users', (req, res) => {
            userCollection.insertOne(req.body, function(err, insertRes){
                if (err) throw err
                userCollection.findOne(insertRes.insertedId).then(
                    result => {
                        console.log(result)
                        res.send(result)
                    })
            })
        })

        app.put('/users/:phone', (req, res) => {
            userCollection.findOneAndUpdate(req.params, {$set: req.body}).then(result =>{
                res.json(result);
            })
        })

        app.delete('/users', (req, res) => {
            userCollection.deleteOne(userCollection.findOne(req.body), function(err, result){
                if (err) throw err
                res.json(result);
            })
        })
        
    }
).catch(console.error)

client.close();
