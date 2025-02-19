sap.ui.define(["sap/ui/test/Opa5", 
	"sap/suite/ui/generic/template/integration/SalesOrderSegButtons/pages/Common",
	"sap/suite/ui/generic/template/integration/SalesOrderSegButtons/pages/actions/ObjectPageActions",
	"sap/suite/ui/generic/template/integration/SalesOrderSegButtons/pages/assertions/ObjectPageAssertions",
	"sap/suite/ui/generic/template/integration/SalesOrderSegButtons/utils/OpaModel"],

	function(Opa5, Common, ObjectPageActions, ObjectPageAssertions, OpaModel) {
		"use strict";

		var VIEWNAME = "Details";
		var VIEWNAMESPACE = "sap.suite.ui.generic.template.ObjectPage.view.";
		var OP1_PREFIX_ID = "ManageSalesOrderWithSegButtons::sap.suite.ui.generic.template.ObjectPage.view.Details::C_STTA_SalesOrder_WD_20--";
		
		var SALESORDER_ENTITY_TYPE = "STTA_SALES_ORDER_WD_20_SRV.C_STTA_SalesOrder_WD_20Type";
		var SALESORDER_ENTITY_SET = "C_STTA_SalesOrder_WD_20";
		
		console.log ( "OPA5::ObjectPage::CONSTANTS " 
				+ " VIEWNAME: " + VIEWNAME
				+ " VIEWNAMESPACE: " + VIEWNAMESPACE
				+ " OP1_PREFIX_ID: " + OP1_PREFIX_ID
				+ " SALESORDER_ENTITY_TYPE: " + SALESORDER_ENTITY_TYPE
				+ " SALESORDER_ENTITY_SET: " + SALESORDER_ENTITY_SET
		);
		
		OpaModel.metaModel.loaded().then(function(){
			var oSALESORDER_ENTITY_TYPE = OpaModel.getEntityType(SALESORDER_ENTITY_TYPE);
			var oSALESORDER_ENTITY_SET = OpaModel.getEntitySet(SALESORDER_ENTITY_SET);		

			Opa5.createPageObjects({
				onTheObjectPage: {
					baseClass: Common,
					actions: ObjectPageActions(OP1_PREFIX_ID, VIEWNAME, VIEWNAMESPACE),
					assertions: ObjectPageAssertions(OP1_PREFIX_ID, VIEWNAME, VIEWNAMESPACE, oSALESORDER_ENTITY_TYPE, oSALESORDER_ENTITY_SET)
				}
			});
		});		
	}
);
