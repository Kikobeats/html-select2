var select = require('../')
var test = require('tape')
var tokenize = require('html-tokenize')
var through = require('through2')
var fs = require('fs')

test('unclosed_script', function (t) {
  t.plan(1)

  var scripts = select()
  var heads = select()

  scripts.select('script', function (e) {
    var r = e.createReadStream()
    var w = e.createWriteStream()
    w.write(['text', 'TEST'])
    r.pipe(w)
  })

  // pipe HTML content to script transformer
  heads.select('html', function (e) {
    var s = e.createStream()
    s.pipe(scripts).pipe(s)
  })

  var input = []
  var output = []

  fs.createReadStream(__dirname + '/unclosed_script/index.html')
    .pipe(tokenize())
    .on('data', function (chunk) {
      input.push(chunk)
    })
    .on('end', function () {
    })
    .pipe(heads)
    .on('data', function (chunk) {
      output.push(chunk)
    })
    .on('end', function () {
      var injected = output.filter(function (row) {
        return row[0] == 'text'
      })
        .filter(function (row) {
          return row[1].toString() == 'TEST'
        })

      // check it's been injected
      t.equals(injected.length, 1)
    })

  heads.resume()
})
