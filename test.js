const test = require('ava')

const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')

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

test('approved-book-list.json git book UUIDs are unique between books', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const uuidAcc = new Set()
  list.approved_books
  .filter(entry => !!entry.repository_name) // only check in repos
  .forEach(entry => {
    // Verify our UUIDs were not in any other repo
    entry.versions.forEach(v => {
      v.commit_metadata.books.forEach(b => {
        if (uuidAcc.has(b.uuid)) {
          t.fail(`Duplicate book UUID found: ${b.uuid}`)
        }
      })
    })

    // Add our UUIDs to the set of seen UUIDs
    entry.versions.forEach(v => {
      v.commit_metadata.books.forEach(b => {
        uuidAcc.add(b.uuid)
      })
    })
  })
  t.pass()
})

test('approved-book-list.json git shas are completely unique', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const shaAcc = new Set()
  list.approved_books
  .filter(entry => !!entry.repository_name) // only check in repos
  .forEach(entry => {
    entry.versions.forEach(({commit_sha}) => {
      if (shaAcc.has(commit_sha)) {
        t.fail(`Duplicate commit sha found: ${commit_sha}`)
      } else {
        shaAcc.add(commit_sha)
      }
    })
  })
  t.pass()
})

test('approved-book-list.json archive book UUIDs are unique among archive books', t => {
  const listData = fs.readFileSync(approvedBookListPath, { encoding: 'utf8' })
  const list = JSON.parse(listData)
  const bookUUIDs = list.approved_books
  .filter(entry => !!entry.collection_id) // Only operate on archive entries
  .map(
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
      t.truthy(b.versions.length > 0, `No version for repository_name=${b.repository_name}`)
    } else {
      t.truthy(abl.approved_versions.find(v => v.collection_id === b.collection_id), `No version for collection_id=${b.collection_id}`)
    }
  })
})
