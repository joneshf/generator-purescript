'use strict'

var path = require('path')
  ;

var module2DirFile = function (module) {
  var split = module.split('.')
    , file = split.pop()
    , prefixed = ['src'].concat(split);
  return { dir: path.join.apply(null, prefixed)
         , file: file
         , module: module
         };
};

module.exports = {
  module2DirFile: module2DirFile
}
