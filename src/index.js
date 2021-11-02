const express = require('express')

const { v4: uuidV4 } = require('uuid')

const app = express()

const customers = []

app.use(express.json())

app.post('/account', (request, response) => {

  const { cpf, name } = request.body
  const id = uuidV4();

  const user = {
    cpf,
    name,
    id,
    statement: []
  }

  customers.push(user)

  return response.status(201).json(user)

})

app.listen(3333)