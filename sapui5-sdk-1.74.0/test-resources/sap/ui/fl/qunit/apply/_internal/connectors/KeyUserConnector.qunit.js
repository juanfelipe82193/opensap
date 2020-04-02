/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector"
], function(
	sinon,
	Utils,
	KeyUserConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loadFlexData trigger the correct request to back end then store the token and settings value", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference",
				appVersion: "1.0.0",
				draftLayer: "CUSTOMER"
			};
			var mParameter = {
				appVersion: "1.0.0",
				draft: true
			};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/data/reference?appVersion=1.0.0";
			var oStubGetUrlWithQueryParameters = sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response : {
					changes: [],
					settings: {
						isKeyUser: true,
						isVariantSharingEnabled: true
					}
				},
				xsrfToken : "newToken",
				status: "200"
			});
			return KeyUserConnector.loadFlexData(mPropertyBag).then(function () {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/keyuser/v1/data/", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[2], mParameter, "with correct parameters input");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
				assert.equal(oStubSendRequest.getCall(0).args[2].xsrfToken, undefined, "with correct token");
				assert.equal(KeyUserConnector.xsrfToken, "newToken", "new token is set");
				assert.deepEqual(KeyUserConnector.settings, { isKeyUser: true, isVariantSharingEnabled: true}, "new settings is stored");
			});
		});

		QUnit.test("loadFlexData merges the compVariants in the changes", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference",
				appVersion: "1.0.0"
			};
			var sExpectedUrl = "/flexKeyuser/flex/keyuser/v1/data/reference?appVersion=1.0.0";
			sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			sandbox.stub(Utils, "sendRequest").resolves({
				response : {
					changes: [1],
					compVariants: [2]
				},
				xsrfToken : "newToken",
				status: "200"
			});
			return KeyUserConnector.loadFlexData(mPropertyBag).then(function (oFlexData) {
				assert.equal(oFlexData.changes.length, 2, "two entries are in the change section");
				assert.equal(oFlexData.changes[0], 1, "the change entry is contained");
				assert.equal(oFlexData.changes[1], 2, "the compVariant entry is contained");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});