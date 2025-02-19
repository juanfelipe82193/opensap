/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

// Provides control sap.ui.mdc.filterbar.FilterItemLayout.
sap.ui.define(['sap/ui/layout/VerticalLayout', 'sap/ui/layout/VerticalLayoutRenderer', 'sap/m/Label'
], function( VerticalLayout, VerticalLayoutRenderer, Label) {
	"use strict";

	/**
	 * Constructor for a new filterBar/FilterItemLayout.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Represents a filter item on the UI.
	 * @extends sap.ui.layout.VerticalLayout
	 * @constructor
	 * @private
	 * @since 1.61.0
	 * @alias sap.ui.mdc.base.filterbar.FilterItemLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterItemLayout = VerticalLayout.extend("sap.ui.mdc.filterbar.FilterItemLayout", /** @lends sap.ui.mdc.filterbar.FilterItemLayout.prototype */
	{
		renderer: VerticalLayoutRenderer.render
	});


	FilterItemLayout.prototype._setLabel = function (oFilterField) {
		this._oLabel = new Label(oFilterField.getId() + "-label");

		oFilterField.connectLabel(this._oLabel);

		if (oFilterField.getFieldPath() === "$search") {
			this._oLabel.setText("\u2008");
		} else {
			this._oLabel.addStyleClass("sapUiMdcBaseFilterBarLabel");
		}
	};

	FilterItemLayout.prototype._getFilterField = function () {
		return this._oFilterField;
	};

	FilterItemLayout.prototype._getFieldPath = function () {
		return this._sFieldPath;
	};

	FilterItemLayout.prototype.setFilterField = function (oFilterField) {
		this._setLabel(oFilterField);
		this._oFilterField = oFilterField;
		this._sFieldPath = oFilterField.getFieldPath();
	};

	FilterItemLayout.prototype.getContent = function () {
		var aContent = [];
		aContent.push(this._oLabel);
		aContent.push(this._oFilterField);

		return aContent;
	};

	FilterItemLayout.prototype.exit = function () {
		this._oFilterField = null;
		this._sFieldPath = null;

		if (this._oLabel && !this._oLabel.bIsDestroy) {
			this._oLabel.destroy();
			this._oLabel = undefined;
		}
	};

	return FilterItemLayout;

});
