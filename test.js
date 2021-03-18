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
    entry => entry.collection_id != null ? entry.collection_id : entry.repository_name
  )
  list.approved_versions.forEach(entry => {
    const bookId = entry.collection_id != null ? entry.collection_id : entry.repository_name
    if (!validBookIds.includes(bookId)) {
      t.fail(`Approved version references unknown book ${bookId}`)
    }
  });
  t.pass()
})

test('approved-book-list.json collection_ids / repository names are unique', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  list.approved_books.reduce((acc, entry) => {
    const bookId = entry.collection_id != null ? entry.collection_id : entry.repository_name
    if (acc.includes(bookId)) {
      t.fail(`Duplicate book ID (collection or repository name) found: ${bookId}`)
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

test('approved-book-list.json has at least one version for each book', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const abl = JSON.parse(listData)
  abl.approved_books.forEach(b => {
    if (b.repository_name) {
      t.truthy(abl.approved_versions.find(v => v.repository_name === b.repository_name), `No version for repository_name=${b.repository_name}`)
    } else {
      t.truthy(abl.approved_versions.find(v => v.collection_id === b.collection_id), `No version for collection_id=${b.collection_id}`)
    }
  })
})

test('approved-books.json entries match approved-book-list.json', t => {
  const approvedBooksData = fs.readFileSync(approvedBooksPath, { encoding: 'utf8' })
  const approvedBookListData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const slugData = fs.readFileSync(bookSlugsPath, { encoding: 'utf8' })


  const slugs = JSON.parse(slugData)
  const approvedBooks = JSON.parse(approvedBooksData)
  const approvedBookList = JSON.parse(approvedBookListData)

  const ablBooksByCollectionId = approvedBookList.approved_books.reduce((acc, entry) => {
    acc[entry.collection_id] = {
      "collection_id": entry.collection_id,
      "style": entry.style,
      "server": entry.server,
      "tutor_only": entry.tutor_only,
      "uuid": entry.books[0].uuid,
      "slug": entry.books[0].slug,
    }
    return acc
  }, {})

  const ablBooksById = approvedBookList.approved_versions.reduce ((acc, entry) => {
    const bookId = `${entry.collection_id}@${entry.content_version}`
    acc[bookId] = {
      ...ablBooksByCollectionId[entry.collection_id],
      "version": entry.content_version
    }
    return acc
  }, {})

  const bookSlugsByUUID = slugs.reduce((acc, book) => {
    acc[book['uuid']] = book['slug']
    return acc
  }, {})

  approvedBooks.forEach((entry) => {
    const bookId = `${entry.collection_id}@${entry.version}`
    const ablBookEntry = ablBooksById[bookId]

    if (ablBookEntry === undefined) {
      t.fail(`Book ${bookId} not found in approved-book-list.json`)
    }

    entry['slug'] = bookSlugsByUUID[entry.uuid]
    delete entry.name

    for (const key in entry) {
      if (entry[key] !== ablBookEntry[key]) {
        t.fail(`Book ${bookId} in approved-books.json does not match ${key} in corresponding approved-book-list.json entry`)
      }
    }
  })
  t.pass()
})
