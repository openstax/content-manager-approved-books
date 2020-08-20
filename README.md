### *** For user documentation please go [here](https://docs.google.com/document/d/1-chbEegeAZmk2bx9-UsYQ0_SQxp1v0rGFDdQC0Efgbs/edit#) ***






[Content Manager Approved Books](./approved-books.json)

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

To access and make changes to the approved books list:

Navigate to: [approved-books.json](https://github.com/openstax/content-manager-approved-books/blob/master/approved-books.json)

From here changes will be made via the GitHub user interface:

1. Select the writing utensil in the upper right corner "Edit this file"

<img width="1122" alt="Screen Shot 2020-06-29 at 2 17 49 PM" src="https://user-images.githubusercontent.com/11208820/86046765-6b908600-ba13-11ea-8c88-06bdad16870c.png">

2. The file's state will change allowing you to make edits, make changes as needed:
<img width="1338" alt="Screen Shot 2020-06-29 at 2 08 48 PM" src="https://user-images.githubusercontent.com/11208820/86046820-8236dd00-ba13-11ea-9780-1f4ed8026030.png">
It would be best to make one change at a time, so that each commit will represent one change, in case changes need to be undone.

3. After changes are made scroll to the bottom of the page, to commit your changes:
<img width="1304" alt="Screen Shot 2020-06-29 at 2 13 20 PM" src="https://user-images.githubusercontent.com/11208820/86046852-911d8f80-ba13-11ea-80bb-f5aec894ec19.png">

- Give your change/commit a title -  i.e.  "Update psychology version"
- Add any additional notes
- Select "Create a new branch for this commit and create a pull request"
- Click "Commit changes"

A PR will be created for the changes made,  assign a reviewer for your PR.

Once the PR is merged and the changes have been accepted. This will trigger work to be done.

Note: Every version of a book should have it's own entry.

## Run Tests

```console

$ cd content-manager-approved-books
$ npm install 
$ npm run test

```
