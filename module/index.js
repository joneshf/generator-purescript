'use strict'

var yeoman = require('yeoman-generator')
  , funcs = require('../common/functions.js')
  , path = require('path')
  ;

var ModuleGenerator = yeoman.generators.NamedBase.extend({
  init: function() {
    this.dirAndFile = funcs.module2DirFile(this.name);
  },
  app: function(){
    this.moduleName = this.dirAndFile.module;
    this.mkdir(this.dirAndFile.dir);
    this.template('_template.purs', path.join( this.dirAndFile.dir
                                             , this.dirAndFile.file + '.purs'));
  }
});

module.exports = ModuleGenerator;
