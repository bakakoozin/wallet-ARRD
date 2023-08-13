require('dotenv').config()
const express = require('express')
const { PORT, MONGO_URI } = require('./src/constants')
const app = express()
const { MongoClient } = require('mongodb')

const client = new MongoClient(MONGO_URI)
const njord = client.db('njord_prod')
const valhalla = client.db('valhalla_dev')

app.get('/', async (_req, res) => {
  await client.connect()

    const usersACollection = valhalla.collection('users')
    const usersBCollection = njord.collection('users')
        
          const usersA = await usersACollection.find({}).toArray();
          const usersB = await usersBCollection.find({}).toArray();
      
          const usersByMail = {};
      
          usersB.forEach(usersB => {
            const email = usersB.email;
            const wallet = usersB.wallet;
      
            if (!usersByMail[email]) {
              usersByMail[email] = { wallet: 0 };
            }
      
            usersByMail[email].wallet += wallet;
          });
      
          usersA.forEach(usersA => {
            const email = usersA.email;
      
            if (usersByMail[email]) {
              const walletToAdd = usersByMail[email].wallet;
              usersA.wallet += walletToAdd;
            }
          });
      
          usersA.forEach(usersA => {
            console.log(usersA);
        })

res.json(usersB)

})