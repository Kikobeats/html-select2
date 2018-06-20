# html-select2

![Last version](https://img.shields.io/github/tag/Kikobeats/html-select2.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/html-select2/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/html-select2)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/html-select2.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/html-select2)
[![Dependency status](https://img.shields.io/david/Kikobeats/html-select2.svg?style=flat-square)](https://david-dm.org/Kikobeats/html-select2)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/html-select2.svg?style=flat-square)](https://david-dm.org/Kikobeats/html-select2#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/html-select2.svg?style=flat-square)](https://www.npmjs.org/package/html-select2)

> Match & splice a tokenized HTML stream with css selectors. Like html-select but maintained.

## Install

```bash
$ npm install html-select2 --save
```

## Usage

### Readable Stream

Given a tokenized stream from
[html-tokenize](https://npmjs.org/package/html-tokenize), this program will
print the dt tags matching the selector `'ul > li dt'`:

``` js
const select = require('html-select2')
const tokenize = require('html-tokenize')
const fs = require('fs')
const path = require('path')

const stream = select('ul > li dt', function (e) {
  console.log('*** MATCH ***')
  e.createReadStream().on('data', function (row) {
    console.log([row[0], row[1].toString()])
  })
})

fs
  .createReadStream(path.join(__dirname, '/page.html'))
  .pipe(tokenize())
  .pipe(stream)

stream.resume()
```

The `s.resume()` is necessary to put the stream into flow mode since we aren't
doing anything with the output of `s`.

Now this html input:

``` html
<html>
  <head>
    <title>presentation examples</title>
  </head>
  <body>
    <h1>hello there!</h1>
    <p>
      This presentation contains these examples:
    </p>

    <ul>
      <li>
        <dt>browserify</dt>
        <dd>node-style <code>require()</code> in the browser</dd>
      </li>

      <li>
        <dt>streams</dt>
        <dd>shuffle data around with backpressure</dd>
      </li>

      <li>
        <dt>ndarray</dt>
        <dd>n-dimensional matricies on top of typed arrays</dd>
      </li>

      <li>
        <dt>music</dt>
        <dd>make music with code</dd>
      </li>

      <li>
        <dt>voxeljs</dt>
        <dd>make minecraft-style games in webgl</dd>
      </li>

      <li>
        <dt>trumpet</dt>
        <dd>transform html with css selectors and streams</dd>
      </li>
    </ul>
  </body>
</html>
```

gives this output:

```
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'browserify' ]
[ 'close', '</dt>' ]
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'streams' ]
[ 'close', '</dt>' ]
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'ndarray' ]
[ 'close', '</dt>' ]
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'music' ]
[ 'close', '</dt>' ]
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'voxeljs' ]
[ 'close', '</dt>' ]
*** MATCH ***
[ 'open', '<dt>' ]
[ 'text', 'trumpet' ]
[ 'close', '</dt>' ]
```

### Transform Stream

Using the same html file from the previous example,
this script converts everything inside `dt` elements to uppercase:

``` js
const select = require('html-select2')
const tokenize = require('html-tokenize')
const through = require('through2')
const fs = require('fs')
const path = require('path')

const stream = select('dt', function (e) {
  const tr = through.obj(function (row, buf, next) {
    this.push([ row[0], String(row[1]).toUpperCase() ])
    next()
  })
  tr.pipe(e.createStream()).pipe(tr)
})

fs.createReadStream(path.join(__dirname, '/page.html'))
  .pipe(tokenize())
  .pipe(stream)
  .pipe(through.obj(function (row, buf, next) {
    this.push(row[1])
    next()
  }))
  .pipe(process.stdout)
```

Running the transform program yields this html output:

``` html
<html>
  <head>
    <title>presentation examples</title>
  </head>
  <body>
    <h1>hello there!</h1>
    <p>
      This presentation contains these examples:
    </p>

    <ul>
      <li>
        <DT>BROWSERIFY</DT>
        <dd>node-style <code>require()</code> in the browser</dd>
      </li>

      <li>
        <DT>STREAMS</DT>
        <dd>shuffle data around with backpressure</dd>
      </li>

      <li>
        <DT>NDARRAY</DT>
        <dd>n-dimensional matricies on top of typed arrays</dd>
      </li>

      <li>
        <DT>MUSIC</DT>
        <dd>make music with code</dd>
      </li>

      <li>
        <DT>VOXELJS</DT>
        <dd>make minecraft-style games in webgl</dd>
      </li>

      <li>
        <DT>TRUMPET</DT>
        <dd>transform html with css selectors and streams</dd>
      </li>
    </ul>
  </body>
</html>
```

## API

``` js
const select = require('html-select2')
```

### var sel = select(selector, cb)

Create a new html selector transform stream `sel`.

`sel` expects [tokenized html objects](https://npmjs.org/package/html-tokenize)
as input and writes tokenized html objects as output.

If `selector` and `cb` are given, `sel.select(selector, cb)` is called
automatically.

### sel.select(selector, cb)

Register a callback `cb(elem)` to fire whenever the css `selector` string
matches.

### elem.createReadStream(opts)

Create a readable object mode stream at the selector. The readable stream
contains all the matching tokenized html objects including the element that
matched and its closing tag.

If `opts.inner` is true, only read the inner content. Otherwrite read the outer
content.

### elem.createWriteStream(opts)

Create a writable object mode stream at the selector. The writable stream writes
into the document stream at the selector, replacing the existing content.

If `opts.inner` is true, only write to the inner content. Otherwrite write to
the outer content.

### elem.createStream(opts)

Create a duplex object mode stream at the selector. The writable side will write
into the document stream  at the selector, replacing the existing content. The
readable side contains the existing content.

If `opts.inner` is true, only read and write to the inner content. Otherwrite
read and write to the outer content.

### elem.setAttribute(key, value)

Set an attribute named by `key` to `value`.

If `value` is `true`, the attribute will appear without an equal sign in the
markup.

### elem.removeAttribute(key)

Remove an attribute named by `key`.

### elem.getAttribute(key)

Return an object with a single attribute value named by `key`.

### elem.getAttributes()

Return an object with all attributes.

### properties

#### elem.name

The string name of the tag.

### events

#### elem.on('close', function () {})

When a matched element is closed for reading and writing, this event fires.

## Supported CSS Selectors

Internally html-select2 uses [cssauron](https://npmjs.org/package/cssauron).

## License

**html-select2** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/html-select2/blob/master/LICENSE.md) License.<br>
Authored and maintained by Kiko Beats with help from [contributors](https://github.com/Kikobeats/html-select2/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
