'use strict'

const tokenize = require('html-tokenize')
const path = require('path')
const fs = require('fs')

const select = require('..')

const s = select('ul > li dt', function (e) {
  console.log('*** MATCH ***')
  e.createReadStream().on('data', function (row) {
    console.error([row[0], row[1].toString()])
  })
})

fs
  .createReadStream(path.join(__dirname, '/page.html'))
  .pipe(tokenize())
  .pipe(s)

s.resume()
