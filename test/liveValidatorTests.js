// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

var assert = require('assert'),
  path = require('path'),
  os = require('os'),
  LiveValidator = require('../lib/liveValidator.js'),
  Constants = require('../lib/util/constants');

describe('Live Validator', function () {
  describe('Initialization', function () {
    it('should initialize with defaults', function () {
      let options = {
        "swaggerPaths": [],
        "git": {
          "url": "https://github.com/Azure/azure-rest-api-specs.git",
          "shouldClone": false
        },
        "directory": path.resolve(os.homedir(), 'repo')
      };
      let validator = new LiveValidator();
      assert.deepEqual(validator.cache, {});
      assert.deepEqual(validator.options, options);
    });
    it('should initialize with user provided swaggerPaths', function () {
      let swaggerPaths = ["swaggerPath1", "swaggerPath2"];
      let options = {
        "swaggerPaths": swaggerPaths,
        "git": {
          "url": "https://github.com/Azure/azure-rest-api-specs.git",
          "shouldClone": false
        },
        "directory": path.resolve(os.homedir(), 'repo')
      };
      let validator = new LiveValidator({ "swaggerPaths": swaggerPaths });
      assert.deepEqual(validator.cache, {});
      assert.deepEqual(validator.options, options);
    });
    it('should initialize with user provided swaggerPaths & directory', function () {
      let swaggerPaths = ["swaggerPath1", "swaggerPath2"];
      let directory = "/Users/username/repos/"
      let options = {
        "swaggerPaths": swaggerPaths,
        "git": {
          "url": "https://github.com/Azure/azure-rest-api-specs.git",
          "shouldClone": false
        },
        "directory": directory
      };
      let validator = new LiveValidator({ "swaggerPaths": swaggerPaths, "directory": directory });
      assert.deepEqual(validator.cache, {});
      assert.deepEqual(validator.options, options);
    });
    it('should initialize with user provided partial git configuration', function () {
      let swaggerPaths = ["swaggerPath1", "swaggerPath2"];
      let directory = "/Users/username/repos/"
      let git = {
        "url": "https://github.com/vishrutshah/azure-rest-api-specs.git"
      }
      let options = {
        "swaggerPaths": swaggerPaths,
        "git": {
          "url": git.url,
          "shouldClone": false
        },
        "directory": directory
      };
      let validator = new LiveValidator({ "swaggerPaths": swaggerPaths, "directory": directory, "git": git });
      assert.deepEqual(validator.cache, {});
      assert.deepEqual(validator.options, options);
    });
    it('should initialize with user provided full git configuration', function () {
      let swaggerPaths = ["swaggerPath1", "swaggerPath2"];
      let directory = "/Users/username/repos/"
      let git = {
        "url": "https://github.com/vishrutshah/azure-rest-api-specs.git",
        "shouldClone": true
      }
      let options = {
        "swaggerPaths": swaggerPaths,
        "git": git,
        "directory": directory
      };
      let validator = new LiveValidator({ "swaggerPaths": swaggerPaths, "directory": directory, "git": git });
      assert.deepEqual(validator.cache, {});
      assert.deepEqual(validator.options, options);
    });
    it('should throw on invalid options types', function () {
      assert.throws(() => {
        new LiveValidator('string');
      }, /must be of type "object"/);
      assert.throws(() => {
        new LiveValidator({ "swaggerPaths": "should be array" });
      }, /must be of type "array"/);
      assert.throws(() => {
        new LiveValidator({ "git": 1 });
      }, /must be of type "object"/);
      assert.throws(() => {
        new LiveValidator({ "git": { "url": [] } });
      }, /must be of type "string"/);
      assert.throws(() => {
        new LiveValidator({ "git": { "url": "url", "shouldClone": "no" } });
      }, /must be of type "boolean"/);
    });
  });
  describe('Initialize cache', function () {
    it('should initialize for arm-mediaservices', function (done) {
      let expectedProvider = 'microsoft.media';
      let expectedApiVersion = '2015-10-01';
      let options = {
        "directory": "./test/swaggers/arm-mediaservices"
      };
      let validator = new LiveValidator(options);
      validator.initialize().then(function () {
        assert.equal(true, expectedProvider in validator.cache);
        assert.equal(1, Object.keys(validator.cache).length);
        assert.equal(true, expectedApiVersion in (validator.cache[expectedProvider]));
        assert.equal(1, Object.keys(validator.cache[expectedProvider]).length);
        assert.equal(2, validator.cache[expectedProvider][expectedApiVersion]['get'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['put'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['patch'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['delete'].length);
        assert.equal(4, validator.cache[expectedProvider][expectedApiVersion]['post'].length);
        done();
      }).catch((err) => {
        assert.ifError(err);
        done();
      }).catch(done);
    });
    it('should initialize for arm-resources', function (done) {
      let expectedProvider = 'microsoft.resources';
      let expectedApiVersion = '2016-09-01';
      let options = {
        "directory": "./test/swaggers/arm-resources"
      };
      let validator = new LiveValidator(options);
      validator.initialize().then(function () {
        assert.equal(true, expectedProvider in validator.cache);
        assert.equal(2, Object.keys(validator.cache).length);
        assert.equal(true, expectedApiVersion in (validator.cache[expectedProvider]));
        assert.equal(1, Object.keys(validator.cache[expectedProvider]).length);
        // 'microsoft.resources' -> '2016-09-01'
        assert.equal(2, validator.cache[expectedProvider][expectedApiVersion]['get'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['delete'].length);
        assert.equal(3, validator.cache[expectedProvider][expectedApiVersion]['post'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['head'].length);
        assert.equal(1, validator.cache[expectedProvider][expectedApiVersion]['put'].length);
        // 'microsoft.unknown' -> 'unknown-api-version'
        assert.equal(4, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['post'].length);
        assert.equal(11, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['get'].length);
        assert.equal(3, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['head'].length);
        assert.equal(5, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['put'].length);
        assert.equal(5, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['delete'].length);
        assert.equal(1, validator.cache[Constants.unknownResourceProvider][Constants.unknownApiVersion]['patch'].length);
        done();
      }).catch((err) => {
        assert.ifError(err);
        done();
      }).catch(done);
    });
    it('should initialize for all swaggers', function (done) {
      let options = {
        "directory": "./test/swaggers"
      };
      let validator = new LiveValidator(options);
      validator.initialize().then(function () {
        assert.equal(5, Object.keys(validator.cache).length);
        assert.equal(2, validator.cache['microsoft.resources']['2016-09-01']['get'].length);
        assert.equal(1, validator.cache['microsoft.resources']['2016-09-01']['head'].length);
        assert.equal(1, validator.cache['microsoft.media']['2015-10-01']['patch'].length);
        assert.equal(4, validator.cache['microsoft.media']['2015-10-01']['post'].length);
        assert.equal(2, validator.cache['microsoft.search']['2015-02-28']['get'].length);
        assert.equal(3, validator.cache['microsoft.search']['2015-08-19']['get'].length);
        assert.equal(1, validator.cache['microsoft.storage']['2015-05-01-preview']['patch'].length);
        assert.equal(4, validator.cache['microsoft.storage']['2015-06-15']['get'].length);
        assert.equal(3, validator.cache['microsoft.storage']['2016-01-01']['post'].length);
        done();
      }).catch((err) => {
        assert.ifError(err);
        done();
      }).catch(done);
    });
  });
  describe('Initialize cache and search', function () {
    it('should return one matched operation for arm-storage', function (done) {
      let options = {
        "directory": "./test/swaggers/arm-storage"
      };
      let listRequestUrl = "https://management.azure.com/subscriptions/subscriptionId/providers/Microsoft.Storage/storageAccounts?api-version=2015-06-15";
      let postRequestUrl = "https://management.azure.com/subscriptions/subscriptionId/providers/Microsoft.Storage/checkNameAvailability?api-version=2015-06-15";
      let deleteRequestUrl = "https://management.azure.com/subscriptions/subscriptionId/resourceGroups/myRG/providers/Microsoft.Storage/storageAccounts/accname?api-version=2015-06-15";
      let validator = new LiveValidator(options);
      validator.initialize().then(function () {
        // Operations to match is StorageAccounts_List
        let operations = validator.getPotentialOperations(listRequestUrl, 'Get');
        assert.equal(1, operations.length);
        assert.equal("/subscriptions/{subscriptionId}/providers/Microsoft.Storage/storageAccounts", operations[0].pathObject.path);

        // Operations to match is StorageAccounts_CheckNameAvailability
        operations = validator.getPotentialOperations(postRequestUrl, 'PoSt');
        assert.equal(1, operations.length);
        assert.equal("/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability", operations[0].pathObject.path);

        // Operations to match is StorageAccounts_Delete
        operations = validator.getPotentialOperations(deleteRequestUrl, 'delete');
        assert.equal(1, operations.length);
        assert.equal("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}", operations[0].pathObject.path);
        done();
      }).catch((err) => {
        assert.ifError(err);
        done();
      }).catch(done);
    });
  });
});