/*
 * ! OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/Storage"
], function(
	ChangePersistenceFactory,
	Storage
) {
	"use strict";

	var _mInstances = {};


	function _doesDraftExist(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.versionNumber === 0;
		});
	}

	function _updateInstanceAfterDraftActivation(aVersions, oVersion) {
		if (_doesDraftExist(aVersions)) {
			aVersions.pop();
		}
		aVersions.push(oVersion);
		return aVersions;
	}

	/**
	 *
	 *
	 * @namespace sap.ui.fl.write._internal.Versions
	 * @since 1.74
	 * @version 1.74.0
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Versions = {};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Versions[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.getVersions = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (_mInstances[sReference] && _mInstances[sReference][sLayer]) {
			return Promise.resolve(_mInstances[sReference][sLayer]);
		}

		return Storage.versions.load(mPropertyBag)
			.then(function (aVersions) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = aVersions;
				return _mInstances[sReference][sLayer];
			});
	};

	Versions.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Activates the draft for a given application and layer.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Version[]>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs or the layer does not support draft handling or there is no draft to activate
	 */
	Versions.activateDraft = function(mPropertyBag) {
		var aVersions;
		return Versions.getVersions(mPropertyBag)
			.then(function (aVersionAfterActivations) {
				var bDraftExists = _doesDraftExist(aVersionAfterActivations);
				aVersions = aVersionAfterActivations;

				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
				var bDirtyChangesExist = oChangePersistence.getDirtyChanges().length > 0;
				if (bDirtyChangesExist) {
					// TODO: the handling should move to the FlexState as soon as it is ready
					return oChangePersistence.saveDirtyChanges(false, undefined, true);
				}

				if (!bDraftExists && !bDirtyChangesExist) {
					return Promise.reject("No draft exists");
				}
			})
			.then(function () {
				return Storage.versions.activateDraft(mPropertyBag);
			})
			.then(function (oVersion) {
				return _updateInstanceAfterDraftActivation(aVersions, oVersion);
			});
	};

	return Versions;
});
