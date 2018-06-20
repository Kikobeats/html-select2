'use strict'

const through = require('through2')
const inherits = require('inherits')
const Splicer = require('stream-splicer')

const selfClosing = require('./self_closing.js')
const getTag = require('./get_tag.js')
const Match = require('./match.js')
const lang = require('./lang.js')

const nextTick =
  typeof setImmediate !== 'undefined' ? setImmediate : process.nextTick

module.exports = Plex
inherits(Plex, Splicer)

function Plex (sel, cb) {
  if (!(this instanceof Plex)) return new Plex(sel, cb)

  var streams = [this._pre(), [], this._post()]
  Splicer.call(this, streams, { objectMode: true })

  this._root = {}
  this._current = this._root

  this._selectors = []
  this._lang = lang()

  if (sel && cb) this.select(sel, cb)
}

Plex.prototype._pre = function () {
  var self = this
  var pipeline

  return through.obj(
    function (row, enc, next) {
      var tree = self._updateTree(row)
      if (!pipeline) pipeline = self.get(1)

      var matched = null

      if (row[0] === 'open') {
        for (var i = 0, l = self._selectors.length; i < l; i++) {
          let s = self._selectors[i]
          if (s.test(tree)) {
            matched = self._createMatch(tree, s.fn)
            this.push(['FIRST', matched])
          }
        }
      }

      if (row[0] === 'open' && tree.selfClosing && tree.parent) {
        self._current = self._current.parent
      }

      if ((matched && tree.selfClosing) || row[0] === 'close') {
        let s = pipeline.get(0)
        if (s && s.finished && s.finished(tree)) {
          s.once('close', function () {
            nextTick(next)
          })
          this.push(['END', row])
          return
        }
      }

      this.push(row)

      next()
    },
    function () {
      this.push(null)
    }
  )
}

Plex.prototype._post = function () {
  var self = this
  return through.obj(
    function (row, enc, next) {
      if (row[0] !== 'FIRST') this.push(row)
      next()
    },
    function () {
      self.emit('end')
    }
  )
}

Plex.prototype.select = function (sel, cb) {
  this._selectors.push({ test: this._lang(sel), fn: cb })
  return this
}

Plex.prototype._updateTree = function (row) {
  if (row[0] === 'open') {
    var node = { parent: this._current, row: row }
    node.selfClosing = node.parent && selfClosing(getTag(node))
    if (!this._current.children) this._current.children = [node]
    else this._current.children.push(node)
    this._current = node
  } else if (row[0] === 'close') {
    if (this._current.parent) this._current = this._current.parent
  }
  return this._current
}

Plex.prototype._createMatch = function (tree, fn) {
  var m = new Match(tree, fn)
  var pipeline = this.get(1)
  pipeline.splice(0, 0, m)

  m.once('close', function () {
    var ix = pipeline.indexOf(m)
    if (ix >= 0) pipeline.splice(ix, 1)

    var next = pipeline.get(ix)
    if (next && next._start === tree) {
      next.write(['END'])
    }
  })

  return m
}
