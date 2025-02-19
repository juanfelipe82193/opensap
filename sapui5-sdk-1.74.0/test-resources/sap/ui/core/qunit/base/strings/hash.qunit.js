/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*global QUnit */
sap.ui.define(['sap/base/strings/hash'], function(hash) {
	"use strict";

	QUnit.module("sap/base/strings/hash");

	QUnit.test("empty string", function(assert) {
		var s = "";
		assert.equal(hash(s), 0, "empty string hash-code is 0");
	});

	QUnit.test("equality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.strictEqual(hash(s), hash(s), "same string - same hash-code");
	});

	QUnit.test("inequality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.notEqual(hash(s), hash(s + "."), "different string - different hash-code");
	});

});