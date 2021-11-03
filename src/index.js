const { response } = require('express')
const express = require('express')

const { v4: uuidV4 } = require('uuid')

const app = express()

const customers = []

app.use(express.json())

const verifyIfExistsAccountCPF = (request, response, next) => {
  const { cpf } = request.headers

  const customer = customers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return response.status(400).json({
      error: "Customer not found!"
    })
  }

  request.customer = customer
  return next()

}
// create account
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

// create depósito
app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body

  const { customer } = request

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})


// get extrato
app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request

  return response.json(customer.statement)

})

app.listen(3333)