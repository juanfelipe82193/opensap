sap.ui.define([
	"sap/ui/core/UIComponent"

], function(UIComponent){
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smarttable.smartTableWithCriticality.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.comp.sample.smarttable.smartTableWithCriticality.SmartTable",
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
					stretch: true,
					files: [
						"SmartTable.view.xml", "SmartTable.controller.js", "../refAppMockServer/metadata.xml"
					]
				}
			}
		}
	});
});