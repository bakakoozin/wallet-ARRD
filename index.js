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

  // nom des constants plus explicites, pas de A, B, hormis, dans les filtres
  const NJORD_USERS = njord.collection('users')
  const VALHALLA_USERS = valhalla.collection('users')

  const valhallaUsers = await VALHALLA_USERS.find({}).toArray()
  const successEmails = []
  const errorEmails = []

  for (const user of valhallaUsers) {
    const userInNjord = await NJORD_USERS.findOne({ email: user.email })
    if (!userInNjord) return

    const response = await VALHALLA_USERS.updateOne(
      { email: user.email },
      {
        $set: {
          wallet: user.wallet + userInNjord.wallet,
          numLicence: user.numLicence,
        },
      }
    )

    // Si la mise à jour a affecté au moins un document, on considère que c'était un succès.
    if (response.modifiedCount > 0) {
      successEmails.push(user.email)
    } else {
      errorEmails.push(user.email)
    }
  }

  // Reset wallets for migrated users
  await VALHALLA_USERS.updateMany(
    { email: { $in: successEmails } },
    { $set: { wallet: 0 } }
  )

  res.json({
    successEmails,
    errorEmails,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})
