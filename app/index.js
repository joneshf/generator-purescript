'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var _ = require('lodash');

var nonEmptyString = function (msg) {
  return function (str) {
    return str === '' ? msg : true;
  };
};

var PurescriptGenerator = yeoman.generators.Base.extend({
  _npmSaveDev: function (deps) {
    this.npmInstall(deps, {saveDev: true});
  },
  _bowerSaveDev: function (deps) {
    this.bowerInstall(deps, {saveDev: true});
  },
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        if (this.grunt) {
          this._npmSaveDev([ 'grunt'
                           , 'grunt-contrib-copy'
                           , 'grunt-contrib-clean'
                           , 'grunt-execute'
                           , 'grunt-purescript'
                           ]);
        }
        if (this.gulp) {
          this._npmSaveDev(['gulp', 'gulp-purescript']);
        }
        this._bowerSaveDev(this.purescriptDeps.concat(this.bowerDeps));
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay( 'Welcome to the marvelous Purescript generator!\n'
                  + 'You can skip any optional guestions with <Enter>.'
                  ));

    var prompts =
      [ { name: 'name'
        , message: 'What would you like to call this project?'
        , validate: nonEmptyString('You have to name the project.')
        }
      , { name: 'version'
        , message: 'What version would you like to start with?'
        , validate: nonEmptyString('You have to supply a version.')
        }
      , { name: 'description'
        , message: 'What description would you like?'
        }
      , { name: 'license'
        , message: 'What license would you like to use?'
        , type: 'list'
        , choices: [ 'AGPL'
                   , 'Apache'
                   , 'BSD2'
                   , 'BSD3'
                   , 'GPL2'
                   , 'GPL3'
                   , 'MIT'
                   , 'None'
                   ]
        }
      , { name: 'gruntGulp'
        , message: 'Would you like to use Grunt and/or Gulp?'
        , type: 'checkbox'
        , choices: ['Grunt', 'Gulp']
        }
      , { name: 'purescriptDeps'
        , message: 'Would you like any of these core modules?'
        , type: 'checkbox'
        , choices: [ { name: 'purescript-arb-instances "Arbitrary and CoArbitrary instances for core data types"'
                     , value: 'purescript-arb-instances'
                     }
                   , { name: 'purescript-arrays "Array utility functions"'
                     , value: 'purescript-arrays'
                     }
                   , { name: 'purescript-control "Monad and Applicative utility functions"'
                     , value: 'purescript-control'
                     }
                   , { name: 'purescript-either "Values with two possibilities"'
                     , value: 'purescript-either'
                     }
                   , { name: 'purescript-enums "Operations for sequentially ordered types"'
                     , value: 'purescript-enums'
                     }
                   , { name: 'purescript-exceptions "Exception effects"'
                     , value: 'purescript-exceptions'
                     }
                   , { name: 'purescript-foldable-traversable "Classes for foldable and traversable data structures"'
                     , value: 'purescript-foldable-traversable'
                     }
                   , { name: 'purescript-foreign "PureScript library for dealing with foreign data (JSON and JavaScript objects)"'
                     , value: 'purescript-foreign'
                     }
                   , { name: 'purescript-globals "Typed definitions for standard Javascript globals"'
                     , value: 'purescript-globals'
                     }
                   , { name: 'purescript-math "Math functions"'
                     , value: 'purescript-math'
                     }
                   , { name: 'purescript-maybe "Optional values"'
                     , value: 'purescript-maybe'
                     }
                   , { name: 'purescript-monoid "Monoid algebraic structure"'
                     , value: 'purescript-monoid'
                     }
                   , { name: 'purescript-quickcheck "A very basic implementation of QuickCheck in PureScript"'
                     , value: 'purescript-quickcheck'
                     }
                   , { name: 'purescript-random "Random number generation"'
                     , value: 'purescript-random'
                     }
                   , { name: 'purescript-strings "String utility functions and regular expressions"'
                     , value: 'purescript-strings'
                     }
                   , { name: 'purescript-tuples "Tuple data type and utility functions"'
                     , value: 'purescript-tuples'
                     }
                   , { name: 'purescript-validation "Applicative-style Validation Mutable value references"'
                     , value: 'purescript-validation'
                     }
                   ]
        }
      , { name: 'bowerDeps'
        , message: 'What other dependencies do you have? '
                 + '(E.g. purescript-transformers purescript-react)'
        , type: 'input'
        }
      , { name: 'modules'
        , message: 'What modules would you like to create? ' +
                   '(E.g. Data.Monoid.First Foo Bar)'
        , type: 'input'
        }
      ];

    this.prompt(prompts, function (props) {
      this.name = props.name;
      this.version = props.version;
      this.description = props.description;
      this.license = props.license;
      this.grunt = props.gruntGulp[0];
      this.gulp = props.gruntGulp[1];
      this.purescriptDeps = props.purescriptDeps;
      this.bowerDeps = _.compact(props.bowerDeps.split(/\s+/));
      this.modules = _.compact(props.modules.split(/\s+/));
      this.dirsAndFiles = this.modules.map(function (module) {
          var split = module.split('.')
            , file = split.pop()
            , prefixed = ['src'].concat(split);
          return { dir: path.join.apply(null, prefixed)
                 , file: file
                 , module: module
                 };
      });

      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir('src');
    this.dirsAndFiles.forEach(function (obj) {
      this.moduleName = obj.module;
      this.mkdir(obj.dir);
      this.template('_template.purs', path.join(obj.dir, obj.file + '.purs'));
    }.bind(this));

    this.template('_template.json', 'package.json');
    this.template('_template.json', 'bower.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    if (this.grunt) {
      this.copy('Gruntfile.js', 'Gruntfile.js');
    }
  }
});

module.exports = PurescriptGenerator;
