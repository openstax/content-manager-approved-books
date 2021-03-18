const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')
const { assert } = require('console')

const approvedBookListPath = path.resolve('./approved-book-list.json')
const ablSchemaPath = path.resolve('./abl-schema.json')

test('approved-book-list.json is JSON', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  JSON.parse(listData)
  t.pass()
})

test('approved-book-list.json matches schema', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const schemaData = fs.readFileSync(ablSchemaPath, { encoding: 'utf8' })
  const schema = JSON.parse(schemaData)
  const validate = new Ajv({ allErrors: true }).compile(schema)
  const isValid = validate(list)
  if (!isValid) { console.error(validate.errors) }
  t.truthy(isValid)
})

test('approved-book-list.json approved-versions reference approved-books', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const validBookIds = list.approved_books.map(
    entry => entry.collection_id != null ? entry.collection_id : entry.repo
  )
  list.approved_versions.forEach(entry => {
    const bookId = entry.collection_id != null ? entry.collection_id : entry.repo
    if (!validBookIds.includes(bookId)) {
      t.fail(`Approved version references unknown book ${bookId}`)
    }
  });
  t.pass()
})

test('approved-book-list.json collection_ids / repos are unique', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  list.approved_books.reduce((acc, entry) => {
    const bookId = entry.collection_id != null ? entry.collection_id : entry.repo
    if (acc.includes(bookId)) {
      t.fail(`Duplicate book ID (collection or repo) found: ${bookId}`)
    }
    acc.push(bookId)
    return acc
  }, [])
  t.pass()
})

test('approved-book-list.json book UUIDs are unique', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const bookUUIDs = list.approved_books.map(
    entry => entry.books.map(
      book => book.uuid
    )
  ).flat()
  bookUUIDs.reduce((acc, entry) =>{
    if (acc.includes(entry)) {
      t.fail(`Duplicate book UUID found: ${entry}`)
    }
    acc.push(entry)
    return acc
  }, [])
  t.pass()
})
