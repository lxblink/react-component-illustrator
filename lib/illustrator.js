'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Array$from = require('babel-runtime/core-js/array/from')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dox = require('dox');

var _dox2 = _interopRequireDefault(_dox);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _acornJsxWalk = require('acorn-jsx-walk');

var _acornJsxWalk2 = _interopRequireDefault(_acornJsxWalk);

var _acornJsxWalkLibWalk = require('acorn-jsx-walk/lib/walk');

var _reactDocgen = require('react-docgen');

var _util = require('./util');

// ---

var Illustrator = (function () {
  function Illustrator(options) {
    _classCallCheck(this, Illustrator);

    this.options = options;
    this.store = {};
  }

  // ---

  _createClass(Illustrator, [{
    key: 'record',
    value: function record(key) {
      var _this = this;

      return function (value) {
        return _this.store[key] = value;
      };
    }
  }, {
    key: 'processExample',
    value: function processExample(file) {
      var _this2 = this;

      return _Promise.resolve(file).then(this.record('examplePath')).then(function () {
        return _this2.relativePath(file);
      }).then(this.record('exampleRequirePath')).then(function () {
        return _fs2['default'].readFileSync(file, { encoding: 'utf-8' });
      }).then(this.record('exampleSource')).then(this.parseExampleDoc.bind(this)).then(this.record('exampleDoc'));
    }
  }, {
    key: 'processComponent',
    value: function processComponent(file) {
      var _this3 = this;

      return _Promise.resolve(file).then(this.record('componentPath')).then(function (file) {
        return (0, _util.toRelativeJsPath)(_this3.store.examplePath, file);
      }).then(function (file) {
        return _fs2['default'].readFileSync(file, { encoding: 'utf-8' });
      }).then(this.record('componentSource')).then(this.parseComponentDoc).then(this.record('componentDoc'));
    }
  }, {
    key: 'parseExampleDoc',
    value: function parseExampleDoc(code) {
      return _dox2['default'].parseComments(code, this.options.doxOptions)[0];
    }
  }, {
    key: 'parseComponentDoc',
    value: function parseComponentDoc(code) {
      return (0, _reactDocgen.parse)(code);
    }
  }, {
    key: 'relativePath',
    value: function relativePath() {
      var paths = _Array$from(arguments, function (p) {
        return _path2['default'].resolve(p);
      });
      paths.unshift(this.options.dest ? _path2['default'].dirname(this.options.dest) : _path2['default'].resolve('.'));

      var relative = _path2['default'].relative.apply(_path2['default'], _toConsumableArray(paths));

      if (relative[0] !== '.') {
        relative = '.' + _path2['default'].sep + relative;
      }

      return relative;
    }
  }, {
    key: 'run',
    value: function run() {
      var _this4 = this;

      var component = this.store.componentPath ? _Object$assign({
        name: _path2['default'].basename(this.store.componentPath, _path2['default'].extname(this.store.componentPath)),
        path: _path2['default'].resolve(this.store.componentPath),
        source: this.store.componentSource
      }, this.store.componentDoc) : null;

      (0, _acornJsxWalk2['default'])(this.store.exampleSource, {
        MethodDefinition: function MethodDefinition(node) {
          return node.key.name === 'render' && _this4.record('exampleRender')(_recast2['default'].print(node).code);
        }
      });

      var example = {
        name: this.getCommentTag('name').string,
        path: _path2['default'].resolve(this.store.examplePath),
        requirePath: this.store.exampleRequirePath,
        description: this.store.exampleDoc.description.full,
        source: this.store.exampleSource,
        renderSource: this.store.exampleRender
      };

      return {
        component: component,
        example: example
      };
    }
  }, {
    key: 'getCommentTag',
    value: function getCommentTag(name) {
      var results = this.store.exampleDoc.tags.filter(function (tag) {
        return tag.type === name;
      });
      return results.length ? results[0] : {};
    }
  }, {
    key: 'component',
    get: function get() {
      if (this.store.componentPath) {
        return this.store.componentPath;
      }

      if (!this.store.exampleDoc) {
        return null;
      }

      var component = this.getCommentTag('component').string;
      return component ? _path2['default'].resolve(this.store.examplePath, component) : null;
    }
  }]);

  return Illustrator;
})();

exports['default'] = Illustrator;
module.exports = exports['default'];