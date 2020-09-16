const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')

const booksListPath = path.resolve('./approved-books.json')
const schemaPath = path.resolve('./schema.json')
const bookSlugsPath = path.resolve('./book-slugs.json')

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

test('book-slugs.json has no duplicate UUIDs', t => {
  const listData = fs.readFileSync(bookSlugsPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  list.reduce((acc, book) => {
    if (acc.includes(book.uuid)) {
      t.fail(`Duplicate slugs found for UUID: ${book.uuid}`)
    }
    acc.push(book.uuid)
    return acc
  }, [])
  t.pass()
})

test('all approved books have a slug defined in book-slugs.json', t => {
  const slugData = fs.readFileSync(bookSlugsPath, { encoding: 'utf8' })
  const bookData = fs.readFileSync(booksListPath, { encoding: 'utf8' })
  const books = JSON.parse(bookData)
  const slugs = JSON.parse(slugData)

  bookToSlugs = slugs.reduce((acc, book) => {
    acc[book['uuid']] = book['slug']
    return acc
  }, {})

  books.forEach(book => {
    if (!(book['uuid'] in bookToSlugs)) {
      t.fail(`No slug found for: ${JSON.stringify(book)}`)
    }
  });
  t.pass()
})
