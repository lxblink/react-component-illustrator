'use strict';

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$values = require('babel-runtime/core-js/object/values')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.generateManifest = generateManifest;
exports.writeToOutput = writeToOutput;
exports.digest = digest;
exports.aggregate = aggregate;
exports.toRelativeJsPath = toRelativeJsPath;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function generateManifest(options, items) {
  if (options.outputFormat === 'commonjs') {
    items = 'module.exports = [' + items.map(digest) + ']';
  } else if (options.outputFormat === 'es6') {
    items = 'export default [' + items.map(digest) + ']';
  } else if (options.outputFormat === 'string') {
    items = JSON.stringify(items);
  }

  return items;
}

function writeToOutput(options, content) {
  if (options.dest) {
    _mkdirp2['default'].sync(_path2['default'].dirname(options.dest));
    _fs2['default'].writeFileSync(options.dest, content);
  }

  if (options.verbose) {
    console.log(content);
  }

  return content;
}

function digest(item) {
  var str = JSON.stringify(item);
  str = str.replace(/"requirePath"\s*:\s*("[^"]*")(\s*,?)/, '"renderer":require($1),$&');
  return str;
}

function aggregate(items) {
  var components = { random: { name: 'Random Examples' } };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(items), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      var component = item.component ? components[item.component.path] : components.random;
      if (!component) {
        component = components[item.component.path] = item.component;
      }

      component.examples = [].concat(_toConsumableArray(component.examples || []), [item.example]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (!components.random.examples) {
    delete components.random;
  }

  return _Object$values(components);
}

function toRelativeJsPath(base, file) {
  var jsPath = _path2['default'].resolve(base, file);
  if (!/\.js$/.test(jsPath) && !/\.tsx$/.test(jsPath)) {
    jsPath += '.js';
  }
  return jsPath;
}