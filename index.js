const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhm74.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        console.log('connected to database')

        const database = client.db("dreamRiderDB");
        const bikeCollection = database.collection("bikeService");
        const userCollection = database.collection("users");
        const uniqueUserCollection = database.collection("uniqueUser");
        // const userCollection = database.collection("user");





        //get bike service
        app.get('/bikes', async (req, res) => {
            const cursor = bikeCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })
        //get bike service single api
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikeCollection.findOne(query)
            res.send(bike);
        })
        //get users

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const user = await cursor.toArray();
            res.send(user);
        })


        //post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        })

        //unique user post  
        app.post('/uniqueUser', async (req, res) => {
            const user = req.body;
            const result = await uniqueUserCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })
        //unique user put for google login/signIn
        app.put('/uniqueUser', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await uniqueUserCollection.updateOne(filter, updateDoc, option)
            res.json(result)
        })

        // make admin from user

        app.put('/uniqueUser/admin',async(req,res)=>{
            const user=req.body;
            console.log('admin put',user);
            const filter={email:user.email};
            const updateDoc={$set:{role:'admin'}};
            const result =await uniqueUserCollection.updateOne(filter,updateDoc);
            res.json(result);

        })

        //get user data
        app.get('/uniqueUser/:email',async(req,res)=>{
            const email=req.params.email;
            console.log(email);
            const query={email:email};
            const user=await uniqueUserCollection.findOne(query);
            let isAdmin=false;
            if(user?.role==='admin'){
                isAdmin=true;
            }
            res.json({admin:isAdmin});

        })


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('this is car mechanic hmm kaj kore')
    console.log('this is server', port)
})



app.listen(port, () => {
    console.log('running genius server on port ki kaj hoise mia ', port)
})