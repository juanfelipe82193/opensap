/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(Log, Base, JsControlTreeModifier) {
	"use strict";

	/*
	 * Change handler for adding a smart form group.
	 * @alias sap.ui.fl.changeHandler.AddGroup
	 * @author SAP SE
	 * @version 1.74.0
	 * @experimental Since 1.27.0
	 */
	var AddGroup = {};

	/**
	 * Adds a smart form group
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied to the control map
	 * @param {sap.ui.comp.smartform.SmartForm|Element} oForm Smart form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - Component in which the change should be applied
	 * @param {object} mPropertyBag.view - View object or xml element representing an ui5 view
	 * @public
	 */
	AddGroup.applyChange = function(oChange, oForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oChangeDefinition = oChange.getDefinition();
		if (oChangeDefinition.texts && oChangeDefinition.texts.groupLabel && oChangeDefinition.texts.groupLabel.value && oChangeDefinition.content && oChangeDefinition.content.group && (oChangeDefinition.content.group.selector || oChangeDefinition.content.group.id)) {
			var sLabelText = oChangeDefinition.texts.groupLabel.value;
			var iInsertIndex = oChangeDefinition.content.group.index;
			var oGroupSelector = oChangeDefinition.content.group.selector;
			var oGroup = oModifier.createControl("sap.ui.comp.smartform.Group", oAppComponent, oView, oChangeDefinition.content.group.selector || oChangeDefinition.content.group.id);
			if (!oGroupSelector) {
				oGroupSelector = oModifier.getSelector(oChangeDefinition.content.group.id, oAppComponent);
			}
			oChange.setRevertData({newGroupSelector: oGroupSelector});

			oModifier.setProperty(oGroup, "visible", true);
			oModifier.setProperty(oGroup, "label", sLabelText);
			oModifier.insertAggregation(oForm, "groups", oGroup, iInsertIndex, oView);

		} else {
			Log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attributes "groupLabel", the group label to be included in the change and "newControlId", the control ID for the control to be added
	 * @param {object} mPropertyBag
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @public
	 */
	AddGroup.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var oAppComponent = mPropertyBag.appComponent;

		if (oSpecificChangeInfo.newLabel) {
			Base.setTextInChange(oChangeDefinition, "groupLabel", oSpecificChangeInfo.newLabel, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.groupLabel attribute required");
		}
		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}
		if (!oChangeDefinition.content.group) {
			oChangeDefinition.content.group = {};
		}

		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oChangeDefinition.content.group.index = oSpecificChangeInfo.index;
		}

		if ( oSpecificChangeInfo.newControlId ){
			oChangeDefinition.content.group.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
	};

	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied to the control map
	 * @param {sap.ui.comp.smartform.SmartForm|Element} oForm Smart form control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @returns {boolean} True if successful
	 * @public
	 */
	AddGroup.revertChange = function(oChange, oForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var mGroupSelector = oChange.getRevertData().newGroupSelector;

		var oGroup = oModifier.bySelector(mGroupSelector, oAppComponent, oView);
		oModifier.removeAggregation(oForm, "groups", oGroup);
		oModifier.destroy(oGroup);
		oChange.resetRevertData();

		return true;
	};

	return AddGroup;
},
/* bExport= */true);