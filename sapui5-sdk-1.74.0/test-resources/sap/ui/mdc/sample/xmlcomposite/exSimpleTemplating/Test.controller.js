sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("sap.ui.mdc.sample.xmlcomposite.exSimpleTemplating.Test", {
		handlePress: function(oEvent) {
			var oField = this.byId("field");
			if (oField.getTextFirst() === "x") {
				oField.setTextFirst("y");
			} else {
				oField.setTextFirst("x");
			}
		}
	});
});
