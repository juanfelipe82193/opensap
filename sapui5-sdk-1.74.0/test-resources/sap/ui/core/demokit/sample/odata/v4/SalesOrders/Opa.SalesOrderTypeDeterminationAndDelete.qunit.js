/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/TypeDeterminationAndDelete",
	"sap/ui/test/opaQunit"
], function (TypeDeterminationAndDeleteTest, opaTest) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Type Determination and Delete", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Type Determination, Delete Sales Orders", function (Given, When, Then) {

		TypeDeterminationAndDeleteTest.typeDeterminationAndDelete(Given, When, Then);

	});
});
