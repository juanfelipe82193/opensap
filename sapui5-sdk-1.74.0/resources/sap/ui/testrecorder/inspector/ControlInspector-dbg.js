/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/testrecorder/inspector/DOMMutation",
	"sap/ui/support/supportRules/ui/external/Highlighter",
	"sap/ui/test/_ControlFinder",
	"sap/ui/testrecorder/inspector/ControlAPI",
	"sap/ui/testrecorder/Constants",
	"sap/ui/testrecorder/DialectRegistry",
	"sap/ui/testrecorder/controlSelectors/UIVeri5SelectorGenerator",
	"sap/ui/testrecorder/codeSnippets/CodeSnippetProvider"
], function (BaseObject, CommunicationBus, CommunicationChannels, DOMMutation, Highlighter, _ControlFinder, ControlAPI, constants,
	DialectRegistry, UIVeri5SelectorGenerator, CodeSnippetProvider) {
	"use strict";

	var oControlInspector = null;
	var oHighlighter = new Highlighter(constants.HIGHLIGHTER_ID);
	var mPrevCodeSnippetRequest;

	var ControlInspector = BaseObject.extend("sap.ui.testrecorder.inspector.ControlInspector", {
		constructor: function () {
			// better be singleton because of the mutation observer
			if (!oControlInspector) {
				Object.apply(this, arguments);
				this._mutation = new DOMMutation(this.getAllControlData);
			} else {
				return oControlInspector;
			}
		}
	});

	ControlInspector.prototype.init = function () {
		this._mutation.start();

		CommunicationBus.subscribe(CommunicationChannels.REQUEST_ALL_CONTROLS_DATA, this.getAllControlData.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CONTROL_DATA, this.getControlData.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.REQUEST_CODE_SNIPPET, this.getCodeSnippet.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.HIGHLIGHT_CONTROL, this.highlightControl.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.SET_DIALECT, this.setDialect.bind(this));
	};

	ControlInspector.prototype.getAllControlData = function () {
		CommunicationBus.publish(CommunicationChannels.RECEIVE_ALL_CONTROLS_DATA, {
			renderedControls: ControlAPI.getAllControlData().renderedControls,
			framework: ControlAPI.getFrameworkData().framework
		});
		UIVeri5SelectorGenerator.emptyCache();
	};

	ControlInspector.prototype.getControlData = function (mData) {
		var mControlData = ControlAPI.getControlData(mData);
		CommunicationBus.publish(CommunicationChannels.RECEIVE_CONTROL_DATA, mControlData);
	};

	ControlInspector.prototype.getCodeSnippet = function (mData) {
		mPrevCodeSnippetRequest = mData;
		return UIVeri5SelectorGenerator.getSelector(mData)
			.then(function (mSelector) {
				return CodeSnippetProvider.getSnippet({
					controlSelector: mSelector,
					action: mData.action
				});
			}).then(function (sSnippet) {
				CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
					codeSnippet: sSnippet
				});
			}).catch(function (oError) {
				CommunicationBus.publish(CommunicationChannels.RECEIVE_CODE_SNIPPET, {
					error: "Could not generate code snippet for " + JSON.stringify(mData) + ". Details: " + oError,
					domElement: mData.domElement
				});
			});
	};

	ControlInspector.prototype.highlightControl = function (mData) {
		if (mData.domElement) {
			oHighlighter.highlight(mData.domElement);
		} else if (mData.controlId) {
			var domElement = _ControlFinder._findElements({id: mData.controlId})[0];
			if (domElement) {
				oHighlighter.highlight(domElement.id);
			}
		}
	};

	ControlInspector.prototype.setDialect = function (sDialect) {
		DialectRegistry.setActiveDialect(sDialect);
		CommunicationBus.publish(CommunicationChannels.DIALECT_CHANGED);
		if (mPrevCodeSnippetRequest) {
			this.getCodeSnippet(mPrevCodeSnippetRequest);
		}
	};

	ControlInspector.prototype.stop = function () {
		this._mutation.stop();
	};

	oControlInspector = new ControlInspector();

	return oControlInspector;

}, true);
