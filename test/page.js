'use strict'

const tokenize = require('html-tokenize')
const through = require('through2')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const select = require('../')

test('page .content', function (t) {
  var expected = [
    ['open', Buffer.from('<div class="content">')],
    ['text', Buffer.from('\n      ')],
    ['open', Buffer.from('<span class="greeting">')],
    ['text', Buffer.from('beep boop')],
    ['close', Buffer.from('</span>')],
    ['text', Buffer.from('\n      ')],
    ['open', Buffer.from('<span class="name">')],
    ['text', Buffer.from('robot')],
    ['close', Buffer.from('</span>')],
    ['text', Buffer.from('\n    ')],
    ['close', Buffer.from('</div>')]
  ]
  t.plan(expected.length)
  var s = select('.content', function (e) {
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

test('page *', function (t) {
  var expected = [
    ['open', Buffer.from('<span class="greeting">')],
    ['text', Buffer.from('beep boop')],
    ['close', Buffer.from('</span>')],
    ['open', Buffer.from('<span class="name">')],
    ['text', Buffer.from('robot')],
    ['close', Buffer.from('</span>')]
  ]
  t.plan(expected.length + 2)
  var s = select('.content *', function (e) {
    t.ok(true, 'match')
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

test('page div.content', function (t) {
  var expected = [
    ['open', Buffer.from('<div class="content">')],
    ['text', Buffer.from('\n      ')],
    ['open', Buffer.from('<span class="greeting">')],
    ['text', Buffer.from('beep boop')],
    ['close', Buffer.from('</span>')],
    ['text', Buffer.from('\n      ')],
    ['open', Buffer.from('<span class="name">')],
    ['text', Buffer.from('robot')],
    ['close', Buffer.from('</span>')],
    ['text', Buffer.from('\n    ')],
    ['close', Buffer.from('</div>')]
  ]
  t.plan(expected.length)
  var s = select('div.content', function (e) {
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

test('page .name', function (t) {
  var expected = [
    ['open', Buffer.from('<h1 class="name">')],
    ['text', Buffer.from('whoa')],
    ['close', Buffer.from('</h1>')],
    ['open', Buffer.from('<span class="name">')],
    ['text', Buffer.from('robot')],
    ['close', Buffer.from('</span>')]
  ]
  t.plan(expected.length)
  var s = select('.name', function (e) {
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

test('page span.greeting', function (t) {
  var expected = [
    ['open', Buffer.from('<span class="greeting">')],
    ['text', Buffer.from('beep boop')],
    ['close', Buffer.from('</span>')]
  ]
  t.plan(expected.length)
  var s = select('span.greeting', function (e) {
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

test('page .content span', function (t) {
  var expected = [
    ['open', Buffer.from('<span class="greeting">')],
    ['text', Buffer.from('beep boop')],
    ['close', Buffer.from('</span>')],
    ['open', Buffer.from('<span class="name">')],
    ['text', Buffer.from('robot')],
    ['close', Buffer.from('</span>')]
  ]
  t.plan(expected.length)
  var s = select('.content span', function (e) {
    e.createReadStream().pipe(
      through.obj(function (row, enc, next) {
        t.deepEqual(row, expected.shift())
        next()
      })
    )
  })
  readStream()
    .pipe(tokenize())
    .pipe(s)
  s.resume()
})

function readStream () {
  return fs.createReadStream(path.join(__dirname, '/page/index.html'))
}
