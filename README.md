# [Content Manager Approved Books](./approved-books.json)

The purpose of this repository is to store and help manage the list of OpenStax books approved for production/distribution use.
The file [approved-books.json](./approved-books.json) is hand-editable and contains the said list of books according to the following pattern:
```text
[
  {
    "name": anything you want e.g. example-book,
    "collection_id": e.g. col12345,
    "server": e.g. staging.cnx.org,
    "style": string corresponding to a style name,
    "version": version string e.g. 1.7
  },
  { ... more books}
]
```

For safety reasons, this repository cannot be pushed to directly. To make changes, one must submit a pull request and wait for tests to complete changes can be pushed to the master branch.

## Distribution Usage

The following link should be used for access to the approved-books list JSON file:

https://raw.githubusercontent.com/openstax/content-manager-approved-books/master/approved-books.json
