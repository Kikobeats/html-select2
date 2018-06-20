'use strict'

const tags = '!-- area base br col embed hr img input keygen link menuitem meta param source track wbr'.split(
  ' '
)
const map = {}
tags.forEach(function (t) {
  map[t] = true
})

module.exports = function (name) {
  return Object.prototype.hasOwnProperty.call(map, name)
}
