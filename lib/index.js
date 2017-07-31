'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.illustrate = illustrate;
exports.illustrateOne = illustrateOne;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _illustrator = require('./illustrator');

var _illustrator2 = _interopRequireDefault(_illustrator);

var _util = require('./util');

// ---

function illustrate(patterns, options) {
  options = parseAndValidateOptions(options);

  var components = (0, _globby2['default'])(patterns, options).then(function (paths) {
    return _Promise.all(paths.map(function (path) {
      return illustrateOne(path, options);
    }));
  }).then(_util.aggregate).then(function (illustrations) {
    return (0, _util.generateManifest)(options, illustrations);
  }).then(function (items) {
    return (0, _util.writeToOutput)(options, items);
  });

  return components;
}

function illustrateOne(file, options) {
  var illustrator = new _illustrator2['default'](options);

  return _Promise.resolve(file).then(function () {
    return illustrator.processExample(file);
  }).then(function () {
    return illustrator.component;
  }).then(function (componentPath) {
    return componentPath ? illustrator.processComponent(componentPath) : null;
  }).then(function () {
    return illustrator.run();
  })['catch'](function (error) {
    return console.error(error, error.stack);
  });
}

// ---

function parseAndValidateOptions() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  options = _Object$assign({
    root: _path2['default'].resolve('.')
  }, options);

  if (options.dest) {
    options.dest = _path2['default'].resolve(options.dest);
  }

  return options;
}