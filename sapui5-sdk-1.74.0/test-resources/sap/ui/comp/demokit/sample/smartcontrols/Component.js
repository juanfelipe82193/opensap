
sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/fl/FakeLrepConnector'
], function (UIComponent, FakeLrepConnector) {
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smartcontrols.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.comp.sample.smartcontrols.Example",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m", "sap.ui.comp"
				]
			},
			config: {
				sample: {
					files: [
						"Example.view.xml",
						"Example.controller.js",
						"mockserver/metadata.xml",
						"mockserver/ProductCollection.json",
						"custom/MyAvailabilityRange.js"
					],
					stretch: true
				}
			}
		},

		onInit: function () {
			FakeLrepConnector.enableFakeConnector("./mockserver/component-test-changes.json");

			// override FakeLrepConnector functions
			// create is called when a new variant is created. Creates an entry in localStorage
			FakeLrepConnector.prototype.create = function (payload, changeList, isVariant) {
				var local, changes = {};
				if (!isVariant) {
					return Promise.resolve();
				}
				if (!payload.creation) {
					payload.creation = new Date().toISOString();
				}
				if (!localStorage.getItem("change")) {
					local = [];
				} else {
					changes = JSON.parse(localStorage.getItem("change"));
					local = changes.changes;
				}
				local.push(payload);
				changes.changes = local;
				localStorage.setItem("change", JSON.stringify(changes));

				return Promise.resolve({
					response: payload,
					status: 'success'
				});
			};

			// called for loading variants in the variant management. Also reads values saved in localStorage
			FakeLrepConnector.prototype.loadChanges = function (sComponentClassName) {
				var local;
				if (!localStorage.getItem("change")) {
					local = [];
				} else {
					local = JSON.parse(localStorage.getItem("change"));
				}
				return new Promise(function (resolve, reject) {
					var result = {
						changes: local,
						componentClassName: sComponentClassName
					};
					resolve(result);
				});
			};

			// called when a variant is updated. Also updates entry in localStorage
			FakeLrepConnector.prototype.update = function (payload, changeName, changelist, isVariant) {
				var local, updatedVariant, updateIndex, changes = {};
				// REVISE ensure old behavior for now, but check again for changes
				if (!isVariant) {
					return Promise.resolve();
				}
				local = JSON.parse(localStorage.getItem("change"));
				updatedVariant = (local.changes).filter(function (item) {
					return (item.fileName == changeName);
				});
				updateIndex = (local.changes).indexOf(updatedVariant[0]);
				if (updateIndex > -1) {
					(local.changes).splice(updateIndex, 1);
				}
				local.changes.push(payload);
				changes = local;
				localStorage.setItem("change", JSON.stringify(changes));
				return Promise.resolve({
					response: payload,
					status: 'success'
				});
			};

			// called when a variant is deleted. Also deletes entry in localStorage
			FakeLrepConnector.prototype.deleteChange = function (params, isVariant) {
				var local, deletedVariant, deleteIndex;
				// REVISE ensure old behavior for now, but check again for changes
				if (!isVariant) {
					return Promise.resolve();
				}
				local = JSON.parse(localStorage.getItem("change"));
				deletedVariant = (local.changes).filter(function (item) {
					return (item.fileName == params.sChangeName);
				});
				deleteIndex = (local.changes).indexOf(deletedVariant[0]);
				if (deleteIndex > -1) {
					(local.changes).splice(deleteIndex, 1);
				}
				localStorage.setItem("change", JSON.stringify(local));

				return Promise.resolve({
					response: undefined,
					status: 'nocontent'
				});
			};
		}
	});

});
