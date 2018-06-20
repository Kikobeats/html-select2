'use strict'

const tokenize = require('html-tokenize')
const through = require('through2')
const path = require('path')
const fs = require('fs')

const select = require('..')

const s = select('dt', function (e) {
  const tr = through.obj(function (row, enc, next) {
    this.push([row[0], String(row[1]).toUpperCase()])
    next()
  })
  tr.pipe(e.createStream()).pipe(tr)
})

fs
  .createReadStream(path.join(__dirname, '/page.html'))
  .pipe(tokenize())
  .pipe(s)
  .pipe(
    through.obj(function (row, buf, next) {
      this.push(row[1])
      next()
    })
  )
  .pipe(process.stdout)
