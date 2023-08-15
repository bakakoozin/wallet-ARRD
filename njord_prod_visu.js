require('dotenv').config()
const express = require('express')
const { PORT, MONGO_URI } = require('./src/constants')
const app = express()
const { MongoClient } = require('mongodb')

const client = new MongoClient(MONGO_URI)

app.get('/', async (_req, res) => {
    await client.connect()

    const database = client.db('njord_dev')
    const Users = database.collection('users')
    const users = await Users.find({}).toArray()

    res.json(users)    
})

app.listen (PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`)
})