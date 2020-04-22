const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')

const booksListPath = path.resolve('./approved-books.json')
const schemaPath = path.resolve('./schema.json')

test('approved-books.json is JSON', t => {
  const listData = fs.readFileSync(booksListPath, { encoding: 'utf8' })
  JSON.parse(listData)
  t.pass()
})

test('approved-books.json matches schema', t => {
  const listData = fs.readFileSync(booksListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const schemaData = fs.readFileSync(schemaPath, { encoding: 'utf8' })
  const schema = JSON.parse(schemaData)
  const validate = new Ajv({ allErrors: true }).compile(schema)
  const isValid = validate(list)
  if (!isValid) { console.error(validate.errors) }
  t.truthy(isValid)
})

test('approved-books.json has no duplicate entries', t => {
  const listData = fs.readFileSync(booksListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  list.reduce((acc, book) => {
    if (acc.some(visited => {
      return (visited.collection_id === book.collection_id
        && visited.version === book.version
        && visited.server === book.server
        && visited.style === book.style)
    })) {
      t.fail(`Duplicate entries found for: ${JSON.stringify(book)}`)
    }
    acc.push(book)
    return acc
  }, [])
  t.pass()
})
