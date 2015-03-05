'use strict';

var app = angular.module('app', false);

var validator = require('is-my-json-valid');

app.controller('validatorController', function ($scope, $http) {

  var self = this;

  // Load the meta-schema
  $http.get('meta-schema/schema.json').success(function (data) {
    self.metaSchema = data;
  });

  this.reset = function() {
    self.document = "";
    self.schema = "";
  };

  this.sample = function(ref) {
    console.debug('sample', ref);

    $http.get('samples/' + ref + '.document.json').success(function(data) {
      self.document = JSON.stringify(data, null, '  ');
    });
    $http.get('samples/' + ref + '.schema.json').success(function(data) {
      self.schema = JSON.stringify(data, null, '  ');
    });

  };

  this.validateDocument = function () {
    console.debug("document");
    self.documentErrors = [];
    self.documentMessage = "";

    // Parse as JSON
    try {
      self.documentObject = JSON.parse(self.document);

      // Do validation
      var documentValidator = validator(this.schemaObject, {
        verbose: true
      });
      documentValidator(this.documentObject);
      console.log(documentValidator.errors)
      if (documentValidator.errors && documentValidator.errors.length) {
        this.documentErrors = documentValidator.errors;
      } else {
        this.documentMessage = "Document conforms to the JSON schema.";
      }
    } catch (e) {
      // Error parsing as JSON
      self.documentErrors = [{message: "Document is invalid JSON. Try http://jsonlint.com to fix it." }];
    }

    console.log("validateDocument");

  };

  this.validateSchema = function () {
    console.debug("schema");
    self.schemaErrors = [];
    self.schemaMessage = "";

    // Parse as JSON
    try {
      self.schemaObject = JSON.parse(self.schema);

      // Can't be done if we don't have the meta schema yet
      if (!this.metaSchema) {
        return;
      }

      // Do validation
      var schemaValidator = validator(this.metaSchema, {
        verbose: true
      });
      schemaValidator(this.schemaObject);
      console.log(schemaValidator.errors)
      if (schemaValidator.errors && schemaValidator.errors.length) {
        this.schemaErrors = schemaValidator.errors;
      } else {
        this.schemaMessage = "Schema is a valid JSON schema.";
      }
    } catch (e) {
      // Error parsing as JSON
      self.schemaErrors = [{ message: "Schema is invalid JSON. Try http://jsonlint.com to fix it." }];
    }

  };

  // Document changes
  $scope.$watch(function () {
    return self.document;
  }, function (newValue, oldValue) {
    self.validateDocument();
  });

  // Schema changes
  $scope.$watch(function () {
    return self.schema;
  }, function (newValue, oldValue) {
    self.validateSchema();
    self.validateDocument();
  });

});
