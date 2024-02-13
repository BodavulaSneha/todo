const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

var isValid = require('date-fns/isValid')
var format = require('date-fns/format')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const validscenario = (request, response, next) => {
  if (
    request.priority !== 'HIGH' &&
    request.priority !== 'MEDIUM' &&
    request.priority !== 'LOW'
  ) {
    response.status(400)
    response.send('Invalid Todo Priority')
  } else if (
    request.status !== 'TO DO' &&
    request.status !== 'IN PROGRESS' &&
    request.status !== 'DONE'
  ) {
    response.status(400)
    response.send('Invalid Todo Status')
  } else if (
    request.category !== 'WORK' &&
    request.category !== 'HOME' &&
    request.category !== 'LEARNING'
  ) {
    response.status(400)
    response.send('Invalid Todo Category')
  } else {
    next()
  }
}

//api-1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, category} = request.query

  const hasPriorityAndStatusProperties = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }

  const hasPriorityProperty = requestQuery => {
    return requestQuery.priority !== undefined
  }

  const hasStatusProperty = requestQuery => {
    return requestQuery.status !== undefined
  }

  const hasCategoryAndStatusProperty = requestQuery => {
    return (
      requestQuery.category !== undefined && requestQuery.property !== undefined
    )
  }

  const hasCategoryProperty = requestQuery => {
    return requestQuery.category !== undefined
  }

  const hascategoryAndPriorityProperty = requestQuery => {
    return (
      requestQuery.category !== undefined && requestQuery.priority !== undefined
    )
  }

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    case hasCategoryAndStatusProperty(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND category = '${category}';`
      break
    case hasCategoryProperty(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}';`
      break
    case hascategoryAndPriorityProperty(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}'
    AND category = '${category}';`
      break
    default:
      getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date as dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

//api-2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoquery = `select id,todo,priority,status,category,due_date as dueDate from todo where id = '${todoId}';`
  const dbresponse = await db.get(todoquery)
  response.send(dbresponse)
})

module.exports = app

//api-3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const newdate = new Date(date)
  const date1 = format(
    new Date(newdate.getFullYear(), newdate.getMonth(), newdate.getDate()),
    'MM',
  )
  const date2 = new Date(date1)
  var result = isValid(
    new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()),
  )
  if (result == true) {
    const query = `select id,todo,priority,status,category,due_date as dueDate from todo where due_date='${result}';`
    const dbresponse = await db.get(query)
    response.send(dbresponse)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})
