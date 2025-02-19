/* global QUnit, sinon */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/field/BoolFieldHelp", // don't want to test async loading in Field here
	"sap/ui/mdc/field/FieldBaseDelegate",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float",
	"sap/m/Input", // don't want to test async loading in Field here
	"sap/m/DatePicker", // don't want to test async loading in Field here
	"sap/m/Button", // test custom control
	"sap/ui/core/ListItem"
], function(
		jQuery,
		qutils,
		DefineConditionPanel,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		Operator,
		BoolFieldHelp,
		FieldBaseDelegate,
		StringType,
		DateType,
		BooleanType,
		IntegerType,
		FloatType,
		Input,
		DatePicker,
		Button,
		ListItem
		) {
	"use strict";

	var oDefineConditionPanelView;
	var oModel;
	var oDataType;
	var oFormatOptions;

	QUnit.module("DefineConditionPanel - sap.ui.mdc.base", {
		beforeEach: function() {
			oDataType = new StringType();
			oFormatOptions = {
					valueType: oDataType,
					maxConditions: -1,
					delegate: FieldBaseDelegate
			};

			oModel = new ConditionModel();
			sap.ui.getCore().setModel(oModel, "cm");

			oDefineConditionPanelView = new DefineConditionPanel("DCP1", {
				conditions: '{cm>/conditions/Name}',
				formatOptions: oFormatOptions
			}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oDefineConditionPanelView.destroy();
			oDataType.destroy();
			oDataType = undefined;
			oFormatOptions = undefined;
			if (oModel) {
				oModel.destroy();
				oModel = undefined;
			}
		}
	});

	QUnit.test("Basic tests", function(assert) {
		assert.equal(oDefineConditionPanelView != null, true, "instance can be created");
	});

	QUnit.test("bind empty condition Model and add one condition", function(assert) {

		assert.equal(oModel.getConditions("Name").length, 1, "one empty condition should exist");

		oModel.addCondition("Name", Condition.createCondition("EQ", ["Andreas"]));
		sap.ui.getCore().applyChanges();
		assert.equal(oModel.getConditions("Name").length, 2, "2 conditions should exist");

	});

	QUnit.test("bind filled condition Model", function(assert) {

		sinon.spy(oDefineConditionPanelView, "updateDefineConditions");
		// update twice to test only one call of dummy row

		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", ["Peter"])
				       ]
			}
		});

		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", ["Andreas"]),
				       Condition.createCondition("EQ", ["Martin"]),
				       Condition.createCondition("EQ", ["Peter"])
				       ]
			}
		});

		var fnDone = assert.async();

		setTimeout(function () {
			assert.ok(oDefineConditionPanelView.updateDefineConditions.calledOnce, "updateDefineConditions called once");
			assert.equal(oModel.getConditions("Name").length, 3, "3 conditions should exist");

			var oAddBtn = sap.ui.getCore().byId("DCP1--addBtn-DCP1--defineCondition-1");
			assert.notOk(oAddBtn.getVisible(), "Button is not visible");

			oAddBtn = sap.ui.getCore().byId("DCP1--addBtn-DCP1--defineCondition-2");
			assert.ok(oAddBtn.getVisible(), "Button is visible");
			oAddBtn.firePress();
			sap.ui.getCore().applyChanges();
			assert.equal(oModel.getConditions("Name").length, 4, "4 conditions should exist");

			var oRemoveBtn = sap.ui.getCore().byId("DCP1--removeBtn-DCP1--defineCondition-2");
			oRemoveBtn.firePress();
			sap.ui.getCore().applyChanges();
			assert.equal(oModel.getConditions("Name").length, 3, "3 conditions should exist");
			oAddBtn = sap.ui.getCore().byId("DCP1--addBtn-DCP1--defineCondition-2");
			assert.ok(oAddBtn.getVisible(), "Button is visible");

			fnDone();
		}, 0);

	});

	QUnit.test("change condition value field", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", ["Andreas"])
				       ]
			}
		});

		var fnDone = assert.async();

		setTimeout(function () {
			assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");

			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oField && oField.isA("sap.ui.mdc.Field"), "Field is mdc Field");
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oControl.isA("sap.m.Input"), "Field uses Input");
			assert.equal(oField.getValue(), "Andreas", "Value of FIeld");

			jQuery(oField.getFocusDomRef()).val("foo");
			qutils.triggerKeyboardEvent(oField.getFocusDomRef().id, jQuery.sap.KeyCodes.ENTER, false, false, false);
			sap.ui.getCore().applyChanges();

			assert.equal(oModel.getConditions("Name").length, 1, "1 conditions should exist");
			assert.equal(oModel.getConditions("Name")[0].values[0], "foo", "condition value should be changed");
			fnDone();
		}, 0);

	});

	QUnit.test("change condition operator", function(assert) {

		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", ["Andreas"])
				       ]
			}
		});

		var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
		var oSelect = oRowGrid.getContent()[0];
		var oItem = new ListItem({key: "BT"});
		oSelect.setSelectedKey("BT");
		oSelect.fireChange({selectedItem: oItem}); // fake item select

		var fnDone = assert.async();
		setTimeout(function () { // as model update is async
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			assert.equal(aItems.length, 2, "Two fields created");
			fnDone();
		}, 0);

		oItem.destroy();

	});

	QUnit.test("use custom operator", function(assert) {

		FilterOperatorUtil.addOperator(new Operator({
			name: "MyOperator",
			filterOperator: "EQ",
			tokenParse: "^#tokenText#$",
			tokenFormat: "#tokenText#",
			tokenText: "Text",
			longText: "Longtext",
			valueTypes: ["self"],
			createControl: function(oType, oOperator, sPath, index) {
				return new Button({text: {path: sPath, type: oType}});
			}
		}));

		if (oDefineConditionPanelView.oOperatorModel) {
			// fake initial rendering (changing operators at runtime is not a real use case)
			oDefineConditionPanelView.oOperatorModel.destroy();
			oDefineConditionPanelView.oOperatorModel = undefined;
		}

		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("MyOperator", ["Test"])
				       ]
			}
		});
		oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				operators: ["MyOperator"],
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);
		oDefineConditionPanelView.rerender(); // to invalidate operator texts
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var oSelect = oRowGrid.getContent()[0];
			aItems = oSelect.getItems();

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oField && oField.isA("sap.m.Button"), "Field is sap.m.Button");
			assert.equal(oField.getText(), "Test", "Value of FIeld");
			assert.equal(aItems.length, 1, "Only one Operator available");
			assert.equal(aItems[0].getText(), "Longtext", "Text of operator");
			fnDone();
		}, 0);

	});

	QUnit.test("use date type", function(assert) {

		oDataType.destroy();
		oDataType = new DateType();
		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", [new Date(2018, 10, 16)])
				       ]
			}
		});
		oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oControl.isA("sap.m.DatePicker"), "Field uses DatePicker");
			var oType = oField.getBindingInfo("value").type;
			assert.ok(oType instanceof DateType, "Type of Field binding");
			assert.ok(oField.getValue() instanceof Date, "Value of Field is Date");
			assert.equal(oField.getValue().getFullYear(), 2018, "Year");
			fnDone();
		}, 0);

	});

	QUnit.test("use boolean type", function(assert) {

		oDataType.destroy();
		oDataType = new BooleanType({}, {nullable: false});
		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", [true])
				       ]
			}
		});
		oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);

		var fnDone = assert.async();
		setTimeout(function () { // to wait for condition update
			sap.ui.getCore().applyChanges();
			setTimeout(function () { // to wait for retemplating
				var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
				var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
				var oField = aItems[0];
				var aContent = oField.getAggregation("_content");
				var oControl = aContent && aContent.length > 0 && aContent[0];

				assert.equal(aItems.length, 1, "One field created");
				assert.ok(oControl.isA("sap.m.Input"), "Field uses Input");
				var oType = oField.getBindingInfo("value").type;
				assert.ok(oType.isA("sap.ui.model.odata.type.Boolean"), "Type of Field binding");
				assert.notOk(oType.oContraints && oType.oContraints.nullabale, "Type of Field has not nullable set to false");
				assert.equal(typeof oField.getValue(), "boolean", "Value of Field is Boolean");
				assert.equal(oField.getValue(), true, "Value");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("use integer type", function(assert) {

		oDataType.destroy();
		oDataType = new IntegerType();
		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", [1])
				       ]
			}
		});
		oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oControl.isA("sap.m.Input"), "Field uses Input");
			var oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Integer"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use float type", function(assert) {

		oDataType.destroy();
		oDataType = new FloatType({emptyString: null});
		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", [1.1])
				       ]
			}
		});
		oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oControl.isA("sap.m.Input"), "Field uses Input");
			var oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.Float"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "number", "Value of Field is Number");
			assert.equal(oField.getValue(), 1.1, "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("use default type", function(assert) {

		oDataType.destroy();
		oModel.setData({
			conditions: {
				Name: [
				       Condition.createCondition("EQ", ["x"])
				       ]
			}
		});
		oFormatOptions = {
				valueType: undefined,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		oDefineConditionPanelView.setFormatOptions(oFormatOptions);
		sap.ui.getCore().applyChanges();

		var fnDone = assert.async();
		setTimeout(function () { // to wait for retemplating
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];

			assert.equal(aItems.length, 1, "One field created");
			assert.ok(oControl.isA("sap.m.Input"), "Field uses Input");
			var oType = oField.getBindingInfo("value").type;
			assert.ok(oType.isA("sap.ui.model.type.String"), "Type of Field binding");
			assert.equal(typeof oField.getValue(), "string", "Value of Field is string");
			assert.equal(oField.getValue(), "x", "Value");
			fnDone();
		}, 0);

	});

	QUnit.test("paste multiple values", function(assert) {

		var fnDone = assert.async();
		setTimeout(function () { // as model update is async
			sap.ui.getCore().applyChanges();
			var oRowGrid = sap.ui.getCore().byId("DCP1--conditionRow-DCP1--defineCondition-0");
			assert.ok(oRowGrid, "Dummy line created");
			var aItems = oRowGrid.getContent()[1].getItems(); // items of HBox
			var oField = aItems[0];
			var aContent = oField.getAggregation("_content");
			var oControl = aContent && aContent.length > 0 && aContent[0];

			var oFakeClipboardData = {
					getData: function() {
						return "AA\nBB\nC	D";
					}
			};

			if (window.clipboardData) {
				window.clipboardData.setData("text", "AA\nBB\nC	D");
			}

			qutils.triggerEvent("paste", oControl.getFocusDomRef(), {clipboardData: oFakeClipboardData});
			setTimeout(function () { // as past handling is async
				var aConditions = oModel.getConditions("Name");
				assert.equal(aConditions.length, 4, "4 Conditions exist");
				assert.equal(aConditions[0].values[0], null, "First Condfition is empty");
				assert.equal(aConditions[1].values[0], "AA", "2. Condfition");
				assert.equal(aConditions[2].values[0], "BB", "3. Condfition");
				assert.equal(aConditions[3].values[0], "C", "4. Condfition - from");
				assert.equal(aConditions[3].values[1], "D", "4. Condfition - to");

				fnDone();
			}, 0);
		}, 0);

	});

});
