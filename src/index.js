const { response, request } = require('express')
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

const getBalance = (statement) => {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }
  }, 0)

  return balance
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

// get account
app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request

  return response.json(customer)
})

// update account
app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request
  const { name } = request.body

  customer.name = name

  return response.status(201).send()


})

// create deposit
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


// saque
app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body
  const { customer } = request

  const balance = getBalance(customer.statement)

  if (balance <= amount) {
    return response.status(400).json({
      error: 'Insufficient funds!'
    })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()


})

// get statement
app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request

  return response.json(customer.statement)

})

// get statement por data
app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request
  const { date } = request.query

  const dateFormat = new Date(date + ' 00:00')

  const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === dateFormat.toDateString())
  console.log(dateFormat)

  return response.json(statement)


})

app.listen(3333)