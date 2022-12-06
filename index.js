const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

//middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xg2xq3m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, re,next) {
    const authHeader = req.headers.authorization;
    if(!authHEader){
        res.status(401).send({message: 'authorization'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
  } )
  
}

async function run() {
    try {
        const serviceCollection = client.db('foodRestaurant').collection('services');
        const reviewCollection = client.db('foodRestaurant').collection('reviews');

        app.post('/jwt',(req,res) =>{
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1day'})
            res.send({token})
            //console.log(user);
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //all review api
        app.get('/review',verifyJWT, async (req, res) => {

            console.log(req.headers.authorization);
            let query = {};
            if (req.query.email) {
                query = {
                    user_email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);

            const reviews = await cursor.toArray()
            res.send(reviews);
        })

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
        app.patch('/reviewEdit/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const result = await reviewCollection.deleteOne(query, updateDoc);
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service_id: id };
            const service = await reviewCollection.findOne(query);
            res.send(service);
        })

        //add menu API
        app.post('/services', async (req, res) => {
            const addmenu = req.body;
            const result = await serviceCollection.insertOne(addmenu);
            res.send(result);
        })

        //add review API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Food restaurant Server is running');
})

app.listen(port, (req, res) => {
    console.log(`Food Restaurant API is Running on : ${port}`);
})