const express = require('express')

const { v4: uuidV4 } = require('uuid')

const app = express()

const customers = []

app.use(express.json())

app.post('/account', (request, response) => {

  const { cpf, name } = request.body

  const customerALreadyExists = customers.some(
    (costumer) => {
      return costumer.cpf === cpf
    })


  if (customerALreadyExists) {
    return response.status(400).json({ error: "Customer already existis!" })
  }



  const user = {
    cpf,
    name,
    id: uuidV4(),
    statement: []
  }

  customers.push(user)

  return response.status(201).json(user)

})

app.listen(3333)