'use strict'

var yeoman = require('yeoman-generator')
  , funcs = require('../common/functions.js')
  , path = require('path')
  , psTemplate = '../../app/templates/_template.purs'
  ;

var ModuleGenerator = yeoman.generators.NamedBase.extend({
  init: function() {
    this.dirAndFile = funcs.module2DirFile(this.name);
  },
  app: function(){
    var directory = this.dirAndFile.dir
      , file = this.dirAndFile.file
      ;
    this.moduleName = this.dirAndFile.module;
    this.mkdir(directory);
    this.template(psTemplate, path.join(directory, file + '.purs'));
  }
});

module.exports = ModuleGenerator;
