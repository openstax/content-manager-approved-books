const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')

const booksListPath = path.resolve('./approved-books.json')
const schemaPath = path.resolve('./schema.json')
const bookSlugsPath = path.resolve('./book-slugs.json')

const gitBooksListPath = path.resolve('./approved-git-books.json')
const gitSchemaPath = path.resolve('./git-schema.json')

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
