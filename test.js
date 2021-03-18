const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')

const approvedBooksPath = path.resolve('./approved-books.json')
const approvedBooksSchemaPath = path.resolve('./schema.json')
const bookSlugsPath = path.resolve('./book-slugs.json')

const approvedBookListPath = path.resolve('./approved-book-list.json')
const ablSchemaPath = path.resolve('./abl-schema.json')

test('approved-books.json is JSON', t => {
  const listData = fs.readFileSync(approvedBooksPath, { encoding: 'utf8' })
  JSON.parse(listData)
  t.pass()
})

test('approved-books.json matches schema', t => {
  const listData = fs.readFileSync(approvedBooksPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const schemaData = fs.readFileSync(approvedBooksSchemaPath, { encoding: 'utf8' })
  const schema = JSON.parse(schemaData)
  const validate = new Ajv({ allErrors: true }).compile(schema)
  const isValid = validate(list)
  if (!isValid) { console.error(validate.errors) }
  t.truthy(isValid)
})

test('approved-books.json has no duplicate entries', t => {
  const listData = fs.readFileSync(approvedBooksPath, { encoding: 'utf8' })
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

test('approved-books.json books have a slug defined in book-slugs.json', t => {
  const slugData = fs.readFileSync(bookSlugsPath, { encoding: 'utf8' })
  const bookData = fs.readFileSync(approvedBooksPath, { encoding: 'utf8' })
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
