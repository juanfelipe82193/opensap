/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderMessageHandling.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderTypeDeterminationAndDelete.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderChangeContext.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreate.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreateMultiple.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreateRelative.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderWriteNonDeferredGroup.qunit"
	], function () {
		QUnit.start();
	});
});
