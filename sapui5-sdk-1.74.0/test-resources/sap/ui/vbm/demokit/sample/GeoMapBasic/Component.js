sap.ui.define(function() {
	"use strict";

	var Component = sap.ui.core.UIComponent.extend("sap.ui.vbm.sample.GeoMapBasic.Component", {

		metadata : {
			rootView : "sap.ui.vbm.sample.GeoMapBasic.V",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
	                stretch : true,
					files : [
						"V.view.xml",
						"C.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
