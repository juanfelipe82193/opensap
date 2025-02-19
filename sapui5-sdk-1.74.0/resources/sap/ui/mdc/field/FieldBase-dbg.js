/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/Device',
	'sap/ui/mdc/library',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/field/ConditionType',
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/mdc/util/BaseType',
	'sap/ui/mdc/util/DateUtil',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/core/message/MessageMixin',
	'sap/base/util/ObjectPath',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/base/Log',
	'sap/base/util/isEmptyObject',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/model/Filter',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	"sap/ui/base/SyncPromise",
	'sap/ui/events/KeyCodes'
], function(
	jQuery,
	Device,
	library,
	FieldBaseRenderer,
	FilterOperatorUtil,
	Condition,
	ConditionType,
	ConditionsType,
	BaseType,
	DateUtil,
	coreLibrary,
	Control,
	MessageMixin,
	ObjectPath,
	deepEqual,
	merge,
	Log,
	isEmptyObject,
	containsOrEquals,
	Filter,
	ManagedObjectModel,
	ManagedObjectObserver,
	SyncPromise,
	KeyCodes
) {
	"use strict";

	var EditMode = library.EditMode;
	var FieldDisplay = library.FieldDisplay;
	var ValueState = coreLibrary.ValueState;
	var CalendarType = coreLibrary.CalendarType;

	/**
	 * Constructor for a new FieldBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A FieldBase is the basic control to be used in Field and FilterField.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version 1.74.0
	 *
	 * @constructor
	 * @alias sap.ui.mdc.field.FieldBase
	 * @author SAP SE
	 * @version 1.74.0
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @experimental
	 */
	var FieldBase = Control.extend("sap.ui.mdc.field.FieldBase", /* @lends sap.ui.mdc.field.FieldBase.prototype */ {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The type of the data handles by the field. this type is used to parse, format and validate the value.
				 */
				dataType: {
					type: "string",
					group: "Data",
					defaultValue: 'sap.ui.model.type.String'
				},

				/**
				 * The constraints of the type specified in <code>dataType</code>
				 */
				dataTypeConstraints: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				/**
				 * The format options of the type specified in <code>dataType</code>
				 */
				dataTypeFormatOptions: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Whether the field is editable, read-only or disabled.
				 */
				editMode: {
					type: "sap.ui.mdc.EditMode",
					group: "Data",
					defaultValue: EditMode.Editable
				},

				/**
				 * Indicates that user input is required.
				 */
				required: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				},

//				/**
//				 * Icon to be displayed as graphical element before the field.
//				 * This can be an image or an icon from the icon font.
//				 */
//				icon: {
//					type: "sap.ui.core.URI",
//					group: "Appearance",
//					defaultValue: null
//				},

				/**
				 * Defines whether the value and/or description of the field is shown and in what order it is shown.
				 */
				display: {
					type: "sap.ui.mdc.FieldDisplay",
					defaultValue: FieldDisplay.Value
				},

				/**
				 * Defines the horizontal alignment of the text that is shown inside the input field.
				 */
				textAlign: {
					type: "sap.ui.core.TextAlign",
					group: "Appearance",
					defaultValue: sap.ui.core.TextAlign.Initial
				},

				/**
				 * Defines the text directionality of the input field, e.g. <code>RTL</code>, <code>LTR</code>
				 */
				textDirection: {
					type: "sap.ui.core.TextDirection",
					group: "Appearance",
					defaultValue: sap.ui.core.TextDirection.Inherit
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the control has no value.
				 * If the value is null no placeholder is shown.
				 */
				placeholder: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
				 *
				 * <b>Note:</b> The visualization of the ValueState is done by the inner rendered control.
				 * If a control is set ( using content, contentEdit or contentDisplay) the control needs to support
				 * valueState behavior, otherwise the valueState is not visualized.
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					group: "Appearance",
					defaultValue: sap.ui.core.ValueState.None
				},

				/**
				 * Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle.
				 */
				valueStateText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines the width of the control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},

				/**
				 * If set, the <code>Field</code> is rendered using a multi line control.
				 *
				 * This property has only effect on type supporting multiple lines
				 */
				multipleLines: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * Sets the maximum amount of conditions that are allowed for this field.
				 *
				 * The default value of -1 indicates that an unlimited amount of conditions can defined.
				 */
				maxConditions: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Sets the conditions that represents the values of the field
				 *
				 * This should be bound to a ConditionModel using the fieldPath
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Sets the label text for the field.
				 *
				 * This can be used by FilterBar or Form to create a Label control for the field.
				 *
				 * @experimental
				 * @since 1.62.0 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				label: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Path to <code>FieldBaseDelegate</code> module that provides the required APIs to execute model specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. Once the required module is associated, this property might not be needed any longer.
				 *
				 * @since 1.72.0
				 * @experimental
				 */
				delegate: {
					type: "object",
					defaultValue: {
//						name: "sap/ui/mdc/field/FieldBaseDelegate",
						name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
						payload : {}
					}
				},

				/**
				 * Internal property to bind the <code>showValueHelp</code> property of the internal <code>Input</code> control.
				 */
				_fieldHelpEnabled: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false,
					visibility: "hidden"
				}

			},
			aggregations: {
				/**
				 * optional content to rendered
				 *
				 * <b>Note:</b> Bind the value holding property of the control to '$field>/conditions'
				 * using <code>sap.ui.mdc.field.ConditionsType</code> as type.
				 *
				 * If the control should show multiple conditions bind it's aggregation to '$field>/conditions'.
				 * The item controls value property bind using <code>sap.ui.mdc.field.ConditionType</code> as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a form are allowed.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * optional content to be rendered if the <code>editMode</code> property is not set to <code>Display</code>.
				 *
				 * <b>Note:</b> If a control is assigned to the <code>content</code> aggregation this one is ignored.
				 *
				 * <b>Note:</b> Bind the value holding property of the control to '$field>/conditions'
				 * using <code>sap.ui.mdc.field.ConditionsType</code> as type.
				 *
				 * If the control should show multiple conditions bind it's aggregation to '$field>/conditions'.
				 * The item controls value property bind using <code>sap.ui.mdc.field.ConditionType</code> as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a form are allowed.
				 *
				 * @since 1.61.0
				 */
				contentEdit: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * optional content to be rendered  if the <code>editMode</code> property is set to <code>Display</code>.
				 *
				 * <b>Note:</b> If a control is assigned to the <code>content</code> aggregation this one is ignored.
				 *
				 * <b>Note:</b> Bind the value holding property of the control to '$field>/conditions'
				 * using <code>sap.ui.mdc.field.ConditionsType</code> as type.
				 *
				 * If the control should show multiple conditions bind it's aggregation to '$field>/conditions'.
				 * The item controls value property bind using <code>sap.ui.mdc.field.ConditionType</code> as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a form are allowed.
				 *
				 * @since 1.61.0
				 */
				contentDisplay: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * internal content if no control given
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},

				/**
				 * optional FieldInfo, used for detail information. This is only active in display mode
				 *
				 * <b>Note:</b> If a special data type is defined or a content control is set this will be ignored.
				 */
				fieldInfo: {
					type: "sap.ui.mdc.field.FieldInfoBase",
					multiple: false
				}
			},
			associations: {
				/**
				 * optional FieldHelp.
				 *
				 * This is an association to allow the usage of one <code>FieldHelp</code> instance on multiple fields
				 */
				fieldHelp: {
					type: "sap.ui.mdc.field.FieldHelpBase",
					multiple: false
				},

				/**
				 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {
				/**
				 * This event is fired when the value of the field is changed - e.g. at each keypress
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a liveChange event
				 */
				liveChange : {
					parameters : {
						/**
						 * The new value of the input.
						 */
						value : {type : "string"},

						/**
						 * Indicate that ESC key triggered the event.
						 */
						escPressed : {type : "boolean"},

						/**
						 * The value of the input before pressing ESC key.
						 */
						previousValue : {type : "string"}
					}
				},
				/**
				 * Fired if the inner control has a press event and this is fired
				 */
				press: {}
			},
			publicMethods: [],
			defaultAggregation: "content"
		},
		_oManagedObjectModel: null
	});

	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(FieldBase.prototype);

	var mControlTypes = {
			Default: {
				edit: "sap/m/Input",
				editMulti: ["sap/m/MultiInput", "sap/m/Token"],
				editMultiLine: "sap/m/TextArea",
				display: "sap/m/Text",
				createEdit: _createInputControl,
				createEditMulti: _createMultiInputControl,
				createEditMultiLine: _createTextAreaControl,
				createDisplay: _createTextControl
			},
			Search: {
				edit: "sap/m/SearchField",
				//editMulti: "sap/m/SearchField", // not used
				display: "sap/m/Text",
				createEdit: _createSearchField,
				//createEditMulti: _createSearchField, // not used
				createDisplay: _createTextControl
			},
			Date: {
				edit: "sap/m/DatePicker",
				editMulti: ["sap/m/MultiInput", "sap/m/Token"], // FieldHelp needed to enter date
				display: "sap/m/Text",
				createEdit: _createDatePickerControl,
				createEditMulti: _createMultiInputControl, // FieldHelp needed to enter date
				createDisplay: _createTextControl
			},
			Time: {
				edit: "sap/m/TimePicker",
				editMulti: ["sap/m/MultiInput", "sap/m/Token"], // FieldHelp needed to enter date
				display: "sap/m/Text",
				createEdit: _createDatePickerControl, // as same API as DatePicker
				createEditMulti: _createMultiInputControl, // FieldHelp needed to enter date
				createDisplay: _createTextControl
			},
			DateTime: {
				edit: "sap/m/DateTimePicker",
				editMulti: ["sap/m/MultiInput", "sap/m/Token"], // FieldHelp needed to enter date
				display: "sap/m/Text",
				createEdit: _createDatePickerControl, // as same API as DatePicker
				createEditMulti: _createMultiInputControl, // FieldHelp needed to enter date
				createDisplay: _createTextControl
			},
			Link: {
				edit: "sap/m/Input",
				editMulti: ["sap/m/MultiInput", "sap/m/Token"],
				editMultiLine: "sap/m/TextArea",
				display: "sap/m/Link",
				createEdit: _createInputControl,
				createEditMulti: _createMultiInputControl,
				createEditMultiLine: _createTextAreaControl,
				createDisplay: _createLinkControl
			},
			Boolean: {
				edit: "sap/m/Input",
				display: "sap/m/Text",
				createEdit: _createBoolInputControl,
				createDisplay: _createTextControl
			},
			Unit: {
				edit: "sap/m/Input",
				editMulti: ["sap/m/MultiInput", "sap/m/Input", "sap/m/Token"],
				display: "sap/m/Text",
				createEdit: _createUnitInputControls,
				createEditMulti: _createUnitMultiInputControls,
				createDisplay: _createTextControl
			}
	};

	var mControls;
	var mDefaultHelps;

	// private function to initialize globals for qUnit tests
	FieldBase._init = function() {

		mControls = {};

		mDefaultHelps = {
				bool: {
					name: "sap/ui/mdc/field/BoolFieldHelp",
					id: "BoolDefaultHelp",
					control: undefined
				}
		};

	};

	FieldBase._init();

	FieldBase.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["display", "editMode", "dataType", "dataTypeFormatOptions", "dataTypeConstraints",
			             "multipleLines", "maxConditions", "conditions", "delegate"],
			aggregations: ["fieldInfo", "content", "contentEdit", "contentDisplay"],
			associations: ["fieldHelp", "ariaLabelledBy"]
		});

		this._oDatePickerRequested = {};

		this.attachEvent("modelContextChange", this._handleModelContextChange, this);

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._aAsyncChanges = [];

		this._oDelegate = undefined;
		this._oDelegatePromise = new Promise(function(fResolve, fReject) {
			this._oDelegateResolve = fResolve;
			this._oDelegateReject = fReject;
		}.bind(this));

	};

	FieldBase.prototype.exit = function() {

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			// as aggregations are destroyed after exit
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		var oContent = this.getContent();
		if (oContent) {
			_detachContentHandlers.call(this, oContent);
		}
		var oContentEdit = this.getContentEdit();
		if (oContentEdit) {
			_detachContentHandlers.call(this, oContentEdit);
		}
		var oContentDisplay = this.getContentDisplay();
		if (oContentDisplay) {
			_detachContentHandlers.call(this, oContentDisplay);
		}

		this._oManagedObjectModel.destroy();
		delete this._oManagedObjectModel;

		this._oObserver.disconnect();
		this._oObserver = undefined;

		if (this._oConditionType && this._oConditionType._bCreatedByField) {
			this._oConditionType.destroy();
			this._oConditionType = undefined;
		}

		if (this._oConditionsType && this._oConditionsType._bCreatedByField) {
			this._oConditionsType.destroy();
			this._oConditionsType = undefined;
		}

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp) {
			oFieldHelp.detachEvent("dataUpdate", _handleHelpDataUpdate, this);
			if (this._bConnected) {
				_handleDisconnect.call(this); // remove event listeners
				oFieldHelp.connect(); // disconnect FieldHelp to remove callbacks
			}
		}

		if (this.iLiveChangeTimer) {
			// do not trigger async suggestion
			clearTimeout(this.iLiveChangeTimer);
		}

	};

	FieldBase.prototype.applySettings = function() {

		Control.prototype.applySettings.apply(this, arguments);

		if (!this._oDelegate && !this._oDelegateLoading) {
			_loadDelegate.call(this, this.getDelegate());
		}

	};

	FieldBase.prototype.onBeforeRendering = function() {

		if (!this._oDelegate) {
			// wait until delegate is loaded
			this._oDelegatePromise.then(function() {_createInternalContent.call(this);}.bind(this));
			return;
		}
		_createInternalContent.call(this);

	};

	FieldBase.prototype.onAfterRendering = function() {

		// TODO: what if only Input re-renders, but not Field
		if (_getFieldHelp.call(this) && this.getEditMode() != EditMode.Display) {
			// disable browsers autocomplete if field help is available
			var aContent = this.getAggregation("_content", []);
			for (var i = 0; i < aContent.length; i++) {
				var oContent = aContent[i];
				var oDomRef = oContent.getFocusDomRef();
				jQuery(oDomRef).attr("autocomplete", "off");
			}
		}

	};

	FieldBase.prototype.onfocusin = function(oEvent) {

		_connectFieldhelp.call(this);

	};

	FieldBase.prototype.onsapup = function(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);
		var oSource = oEvent.srcControl;

		if (oFieldHelp && (!this._bIsMeasure || oSource.getShowValueHelp())) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			oFieldHelp.navigate(-1);
		}

	};

	FieldBase.prototype.onsapdown = function(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);
		var oSource = oEvent.srcControl;

		if (oFieldHelp && (!this._bIsMeasure || oSource.getShowValueHelp())) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			oFieldHelp.navigate(1);
		}

	};

	FieldBase.prototype.onsapenter = function(oEvent) {

		// if same value is entered again no change event is triggered, So we need to close the suggestion here
		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && oFieldHelp.isOpen(true)) {
			oFieldHelp.close();
		}

	};

	FieldBase.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		this.detachEvent("modelContextChange", this._handleModelContextChange, this);

		var oContent = this.getContent();
		if (oContent) {
			_detachContentHandlers.call(this, oContent);
		}
		var oContentEdit = this.getContentEdit();
		if (oContentEdit) {
			_detachContentHandlers.call(this, oContentEdit);
		}
		var oContentDisplay = this.getContentDisplay();
		if (oContentDisplay) {
			_detachContentHandlers.call(this, oContentDisplay);
		}

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		var oClone = Control.prototype.clone.apply(this, arguments);

		this.attachEvent("modelContextChange", this._handleModelContextChange, this);

		if (oContent) {
			_attachContentHandlers.call(this, oContent);
		}
		if (oContentEdit) {
			_attachContentHandlers.call(this, oContentEdit);
		}
		if (oContentDisplay) {
			_attachContentHandlers.call(this, oContentDisplay);
		}

		if (oFieldInfo) {
			oFieldInfo.attachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		return oClone;

	};

	/**
	 * Gets <code>fieldPath</code>.
	 *
	 * If the conditions are bound to a ConditionModel the FieldPath is determined from this binding
	 *
	 * @return {string} fieldPath of the field
	 * @private
	 */
	FieldBase.prototype.getFieldPath = function() {

		var sBindingPath = this.getBindingPath("conditions");
		if (sBindingPath && sBindingPath.startsWith("/conditions/")) {
			return sBindingPath.slice(12);
		} else {
			return "";
		}

	};

	function _triggerChange(aConditions, bValid, vWrongValue, oPromise) {

		if (!oPromise) {
			// not promise -> change is synchronously -> return resolved SyncPromise
			if (bValid) {
				oPromise = Promise.resolve(this._getResultForPromise(aConditions));
			} else {
				oPromise = Promise.reject(vWrongValue);
			}
		}

		this._fireChange(aConditions, bValid, vWrongValue, oPromise);

	}

	FieldBase.prototype._fireChange = function(aConditions, bValid, vWrongValue, oPromise) {
		// to be implemented by Filed and FilterField
	};

	function _createDataType(sType) {

		sType = this._oDelegate.getDataTypeClass(this._oPayload, sType);
		var TypeClass = _getDataTypeClass.call(this, sType);

		if (TypeClass) {
			return new TypeClass(_getDataTypeFormatOptionsForCreate.call(this, sType, this.getDataTypeFormatOptions(), this.getDataTypeConstraints()), this.getDataTypeConstraints());
		}

	}

	function _getDataTypeClass(sType) {

		var oTypeClass = ObjectPath.get(sType || "");
		if (!oTypeClass) {
			throw new Error("DataType cannot be determined");
		}

		return oTypeClass;

	}

	function _getDataType() {

		if (!this._oDataType) {
			this._oDataType = this.getDataType();
			if (typeof this._oDataType === "string") {
				this._oDataType = _createDataType.call(this, this._oDataType);
			}
		}
		return this._oDataType;

	}

	// to be enhanced by Field
	FieldBase.prototype._initDataType = function() {

		if (this._oDataType) {
			this._oDataType.destroy();
			this._oDataType = undefined;
		}

		if (this._oDateOriginalType) {
			this._oDateOriginalType.destroy();
			this._oDateOriginalType = undefined;
		}

		if (this._oUnitOriginalType) {
			this._oUnitOriginalType.destroy();
			this._oUnitOriginalType = undefined;
		}

		delete this._sDisplayFormat;
		delete this._sValueFormat;
		delete this._sCalendarType;

	};

	function _getDataTypeName() {

		if (this._oDataType && typeof this._oDataType === "object") {
			return this._oDataType.getMetadata().getName();
		} else if (this._oDelegate) {
			return this._oDelegate.getDataTypeClass(this._oPayload, this.getDataType());
		} else {
			return this.getDataType();
		}

	}

	function _getDataTypeConstraints() {

		if (this._oDataType && typeof this._oDataType === "object" && this._oDataType.oConstraints) {
			return this._oDataType.oConstraints;
		} else {
			return this.getDataTypeConstraints();
		}

	}

	function _getDataTypeFormatOptions() {

		if (this._oDataType && typeof this._oDataType === "object" && this._oDataType.oFormatOptions) {
			return this._oDataType.oFormatOptions;
		} else {
			return this.getDataTypeFormatOptions();
		}

	}

	/*
	 * To avoid data loss for DatePicker (e.G. in short Year number foe 1918) use ISO format as ValueFormat in DatePickers
	 */
	function _getDataTypeFormatOptionsForCreate(sType, oFormatOptions, oConstraints) {

		if (this.getMaxConditions() !== 1 || this.getEditMode() === EditMode.Display) {
			// only in DatePicker case. TODO: better logic
			return oFormatOptions;
		}

		var sBaseType = this._oDelegate.getBaseType(this._oPayload, sType, oFormatOptions, oConstraints);

		switch (sBaseType) {
		case BaseType.Date:
			this._sValueFormat = "yyyy-MM-dd";
			break;

		case BaseType.DateTime:
			this._sValueFormat = "yyyy-MM-dd'T'HH:mm:ss";
			break;

		case BaseType.Time:
			this._sValueFormat = "HH:mm:ss";
			break;

		default:
			return oFormatOptions;
		}

		// TODO: move this logic to delegate???
		this._sDisplayFormat = "medium";
		if (oFormatOptions) {
			oFormatOptions = merge({}, oFormatOptions); // do not manipulate original object
			if (oFormatOptions.style) {
				this._sDisplayFormat = oFormatOptions.style;
				delete oFormatOptions.style;
			} else if (oFormatOptions.pattern) {
				this._sDisplayFormat = oFormatOptions.pattern;
			}
			if (oFormatOptions.calendarType) {
				this._sCalendarType = oFormatOptions.calendarType;
			}
			oFormatOptions.pattern = this._sValueFormat;
			oFormatOptions.calendarType = CalendarType.Gregorian;
		} else {
			oFormatOptions = {pattern: this._sValueFormat, calendarType: CalendarType.Gregorian};
		}
		return oFormatOptions;

	}

	function _adjustDataTypeForDate() {

		var oType = _getDataType.call(this);
		var sName = oType.getMetadata().getName();
		var oFormatOptions = oType.oFormatOptions;
		var oConstraints = oType.oConstraints;

		// if type is used from binding (Field) or format options are not set correctly -> create new type
		if (!oFormatOptions || oFormatOptions.style ||
				!oFormatOptions.pattern || oFormatOptions.pattern !== this._sValueFormat ||
				!oFormatOptions.calendarType || oFormatOptions.calendarType !== CalendarType.Gregorian) {
			this._oDateOriginalType = this._oDataType;
			_getDataTypeFormatOptionsForCreate.call(this, sName, oFormatOptions, oConstraints); // to determine pattern
			this._oDataType = DateUtil.createInternalType(oType, this._sValueFormat);
			_updateConditionType.call(this);
		}

	}

	function _adjustDataTypeForUnit() {

		var oType = _getDataType.call(this);
		var sName = oType.getMetadata().getName();
		var oFormatOptions = oType.oFormatOptions;
		var oConstraints = isEmptyObject(oType.oConstraints) ? undefined : oType.oConstraints;

		// if type is used from binding (Field) or format options are not set correctly -> create new type
		if (!oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) {
			oFormatOptions = merge({}, oFormatOptions); // do not manipulate original object
			oFormatOptions.showMeasure = false;
			oFormatOptions.strictParsing = true; // do not allow to enter unit in number field
			if (oFormatOptions.customCurrencies) {
				delete oFormatOptions.customCurrencies; // cannot be set from outside
			}
			if (oFormatOptions.customUnits) {
				delete oFormatOptions.customUnits; // cannot be set from outside
			}
			var TypeClass = ObjectPath.get(sName);
			this._oUnitOriginalType = this._oDataType;
			this._oDataType = new TypeClass(oFormatOptions, oConstraints);
			this._oDelegate.initializeInternalUnitType(this._oPayload, this._oDataType, this._oTypeInitialization);
			_updateConditionType.call(this);
		}

	}

	function _handleConditionsChange(aConditions, aConditionsOld) {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp && this._bConnected) {
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
		}

	}

	FieldBase.prototype._getContent = function() {

		var oContent = this.getContent();

		if (!oContent) {
			if (this.getEditMode() === EditMode.Display) {
				oContent = this.getContentDisplay();
			} else {
				oContent = this.getContentEdit();
			}
		}

		if (oContent) {
			return [oContent];
		} else {
			return this.getAggregation("_content", []);
		}

	};

	function _getEditable(sEditMode) {

		if (sEditMode === EditMode.Editable || sEditMode === EditMode.EditableReadOnly || sEditMode === EditMode.EditableDisplay) {
			return true;
		} else {
			return false;
		}

	}

	function _getEditableUnit(sEditMode) {

		if (sEditMode === EditMode.Editable) {
			return true;
		} else {
			return false;
		}

	}

	function _getEnabled(sEditMode) {

		if (sEditMode && sEditMode !== EditMode.Disabled) {
			return true;
		} else {
			return false;
		}

	}

	function _getDisplayOnly(sEditMode) {

		if (sEditMode && sEditMode !== EditMode.Editable) {
			return true;
		} else {
			return false;
		}

	}

	FieldBase.prototype._handleModelContextChange = function(oEvent) {

		// let empty as overwritten in Field

	};

	function _setUIMessage(sMsg) {

		this.setValueState(ValueState.Error);
		this.setValueStateText(sMsg);

	}

	function _removeUIMessage() {

		this.setValueState(ValueState.None);
		this.setValueStateText();

	}

	/**
	 * Observes changes
	 *
	 * to be enhanced by Field, FilterField...
	 *
	 * @param {object} oChanges Changes
	 * @protected
	 */
	FieldBase.prototype._observeChanges = function(oChanges) {

		var fnUpdateInternalContent = function() {
			if (this.getAggregation("_content", []).length > 0) {
				if (!this._oDelegate) {
					// wait until delegate is loaded
					this._oDelegatePromise.then(function() {_createInternalContent.call(this);}.bind(this));
				} else {
					_createInternalContent.call(this);
				}
			}
		};

		if (oChanges.name === "editMode") {
			fnUpdateInternalContent.call(this);
		}

		if (oChanges.name === "multipleLines") {
			fnUpdateInternalContent.call(this);
		}

		if (oChanges.name === "dataType") {
			// check only if different type (in Field type might be already taken from biding)
			if (this._oDataType) {
				var fnCheck = function (sType) {
					var oTypeClass = _getDataTypeClass.call(this, this._oDelegate.getDataTypeClass(this._oPayload, oChanges.current));
					if (!(this._oDataType instanceof oTypeClass)) {
						// TODO: also compare FormatOptions and Constraints
						this._initDataType();
						this.destroyAggregation("_content");
						_updateConditionType.call(this);
					}
				};
				if (!this._oDelegate) {
					// wait until delegate is loaded
					this._oDelegatePromise.then(function() {fnCheck.call(this, oChanges.current);}.bind(this));
					return;
				}
				fnCheck.call(this, oChanges.current);
			}
		}

		if (oChanges.name === "dataTypeFormatOptions" || oChanges.name === "dataTypeConstraints") {
			// if type is not created right now nothing to do
			if (this._oDataType) {
				this._initDataType();
				this.destroyAggregation("_content");
				_updateConditionType.call(this);
			}
		}

		if (oChanges.name === "maxConditions") {
			fnUpdateInternalContent.call(this);
			_updateConditionType.call(this);
		}

		if (oChanges.name === "conditions") {
			this._bParseError = false; // if conditions updated from outside parse error is obsolete. If updated from inside no parse error occurs
			_handleConditionsChange.call(this, oChanges.current, oChanges.old);

			// try to find the corresponding async. change
			var bFound = false;
			var i = 0;
			for (i = 0; i < this._aAsyncChanges.length; i++) {
				var oChange = this._aAsyncChanges[i];
				if (oChange.waitForUpdate && deepEqual(oChange.result, oChanges.current)) {
					_performContentChange.call(this, oChange);
					bFound = true;
					break;
				}
			}
			if (bFound) {
				this._aAsyncChanges.splice(i, 1);
			}
		}

		if (oChanges.name === "display") {
			_destroyInternalContent.call(this); // as bound property can change
			_updateConditionType.call(this);
		}

		if (oChanges.name === "fieldHelp" && oChanges.ids) {
			_fieldHelpChanged.call(this, oChanges.ids, oChanges.mutation);
			_updateConditionType.call(this);
		}

		if (oChanges.name === "fieldInfo" && oChanges.child) {
			_fieldInfoChanged.call(this, oChanges.child, oChanges.mutation);
		}

		if (oChanges.name === "content" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "contentEdit" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "contentDisplay" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "delegate") {
			_loadDelegate.call(this, oChanges.current);
		}

		if (oChanges.name === "ariaLabelledBy" && oChanges.ids) {
			_ariaLabelledByChanged.call(this, oChanges.ids, oChanges.mutation);
		}
	};

	FieldBase.prototype.getFocusDomRef = function() {

		var aContent = this._getContent();

		if (aContent.length > 0) {
			return aContent[0].getFocusDomRef();
		} else {
			return this.getDomRef();
		}

	};

	FieldBase.prototype.getIdForLabel = function() {

		var sId;
		var aContent = this._getContent();
		if (aContent.length > 0) {
			sId = aContent[0].getIdForLabel();
		} else {
			sId = this.getId();
		}

		return sId;

	};

	FieldBase.prototype.getControlForSuggestion = function() {

		var aContent = this._getContent();
		if (aContent.length > 0) {
			if (this._bIsMeasure) {
				return aContent[1];
			} else {
				return aContent[0];
			}
		} else {
			return this;
		}

	};

	FieldBase.prototype.getMaxConditionsForHelp = function() {

		if (this._bIsMeasure) {
			return 1; // only one unit allowed in help
		} else {
			return this.getMaxConditions();
		}

	};

	/*
	 * If Field is inside of a Form use Forms aria logic for label
	 */
	FieldBase.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {

		var oParent = this.getParent();

		if (oParent && oParent.enhanceAccessibilityState) {
			// use Field as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}

		return mAriaProps;

	};

	/**
 	 * @returns {object} Current accessibility state of the control.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	FieldBase.prototype.getAccessibilityInfo = function () {

		var aContent = this._getContent();
		if (aContent.length > 0 && aContent[0].getAccessibilityInfo) {
			return aContent[0].getAccessibilityInfo(); // TODO: unit field
		} else {
			// content not known
			return {};
		}

	};

	function _ariaLabelledByChanged(sId, sMutation) {

		// forward to all content controls (internal and external
		var aContent = this.getAggregation("_content", []);
		var oContent = this.getContent();
		if (oContent) {
			aContent.push(oContent);
		}

		oContent = this.getContentDisplay();
		if (oContent) {
			aContent.push(oContent);
		}

		oContent = this.getContentEdit();
		if (oContent) {
			aContent.push(oContent);
		}

		for (var i = 0; i < aContent.length; i++) {
			oContent = aContent[i];
			if (oContent.getMetadata().getAllAssociations().ariaLabelledBy) {
				if (sMutation === "remove") {
					oContent.removeAriaLabelledBy(sId);
				} else if (sMutation === "insert") {
					oContent.addAriaLabelledBy(sId);
				}
			}
		}

	}

	function _setAriaLabelledBy(oContent) {

		var aAriaLabelledBy = this.getAriaLabelledBy();

		for (var i = 0; i < aAriaLabelledBy.length; i++) {
			var sId = aAriaLabelledBy[i];
			oContent.addAriaLabelledBy(sId);
		}

	}

	/**
	 * Assigns a Label control to the Field or FilterField
	 *
	 * The text of the label is taken from the Field.
	 * The <code>labelFor</code> association is set to the Field.
	 *
	 * @param {sap.ui.core.Label} oLabel Label control
	 * @return {sap.ui.mdc.field.FieldBase} Reference to <code>this</code> to allow method chaining
	 *
	 * @public
	 * @experimental
	 * @since 1.62.0 Disclaimer: this function is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldBase.prototype.connectLabel = function(oLabel) {

		_setModelOnContent.call(this, oLabel);
		oLabel.bindProperty("text", { path: "$field>/label" });
		oLabel.setLabelFor(this);

		return this;

	};

	function _contentChanged(oContent, sMutation, sName) {

		if (sMutation === "remove") {
			_detachContentHandlers.call(this, oContent);
			_restoreKeyboardHandler.call(this, oContent);

			if (this._oContentConditionTypes) {
				delete this._oContentConditionTypes[sName];
			}
			// let the internal control be created on rendering
		} else if (sMutation === "insert") {
//			if (!oContent.isA("sap.ui.core.IFormContent")) {
//				// TODO: allow different content than allowed in Form?
//				throw new Error(oContent + " is not a valid content! Only use valid content in " + this);
//			}
			_modifyKeyboardHandler.call(this, oContent);
			_setModelOnContent.call(this, oContent);
			_attachContentHandlers.call(this, oContent);

			if (this.getAggregation("_content", []).length > 0) {
				_destroyInternalContent.call(this);
			}

			// as for edit and display different Types are possible switch them with edit mode
			if (!this._oContentConditionTypes) {
				this._oContentConditionTypes = {};
			}
			if (!this._oContentConditionTypes[sName]) {
				this._oContentConditionTypes[sName] = {};
			}

			// find out what is bound to conditions
			var oBindingInfo;
			var sProperty;
			for (sProperty in oContent.getMetadata().getAllProperties()) {
				if (oContent.getBindingPath(sProperty) === "/conditions") {
					oBindingInfo = oContent.getBindingInfo(sProperty);
					if (oBindingInfo && oBindingInfo.type && oBindingInfo.type instanceof ConditionsType) {
						this._oContentConditionTypes[sName].oConditionsType = oBindingInfo.type;
					}
					this._sBoundProperty = sProperty;
				}
				if (sProperty === "editable" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: _getEditable });
				}
				if (sProperty === "enabled" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: _getEnabled });
				}
				if (sProperty === "displayOnly" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: _getDisplayOnly });
				}
				if (sProperty === "required" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/required" });
				}
				if (sProperty === "textAlign" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/textAlign" });
				}
				if (sProperty === "textDirection" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/textDirection" });
				}
				if (sProperty === "valueState" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/valueState" });
				}
				if (sProperty === "valueStateText" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/valueStateText" });
				}
				if (sProperty === "placeholder" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/placeholder" });
				}
				if (sProperty === "tooltip" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/tooltip" });
				}
			}

			for (var sAggregation in oContent.getMetadata().getAllAggregations()) {
				if (oContent.getBindingPath(sAggregation) === "/conditions") {
					oBindingInfo = oContent.getBindingInfo(sAggregation);
					if (oBindingInfo && oBindingInfo.template) {
						for (sProperty in oBindingInfo.template.getMetadata().getAllProperties()) {
							var oTemplateBindingInfo = oBindingInfo.template.getBindingInfo(sProperty);
							if (oTemplateBindingInfo && oTemplateBindingInfo.type && oTemplateBindingInfo.type instanceof ConditionType) {
								this._oContentConditionTypes[sName].oConditionType = oTemplateBindingInfo.type;
								break;
							}
						}
					}
					break;
				}
			}
		}

		_setAriaLabelledBy.call(this, oContent);

	}

	function _attachContentHandlers(oContent) {

		if (oContent.getMetadata().getEvents().change) {
			// content has change event -> attach handler
			oContent.attachEvent("change", _handleContentChange, this);
		}
		if (oContent.getMetadata().getEvents().liveChange) {
			// content has liveChange event -> attach handler
			oContent.attachEvent("liveChange", _handleContentLiveChange, this);
		}
		if (oContent.getMetadata().getEvents().press) {
			// content has press event -> attach handler
			oContent.attachEvent("press", _handleContentPress, this);
		}

	}

	function _detachContentHandlers(oContent) {

		if (oContent.getMetadata().getEvents().change) {
			// oldContent has change event -> detach handler
			oContent.detachEvent("change", _handleContentChange, this);
		}
		if (oContent.getMetadata().getEvents().liveChange) {
			// oldContent has liveChange event -> detach handler
			oContent.detachEvent("liveChange", _handleContentLiveChange, this);
		}
		if (oContent.getMetadata().getEvents().press) {
			// oldContent has press event -> detach handler
			oContent.detachEvent("press", _handleContentPress, this);
		}

	}

	function _setUsedConditionType() {

		// remove external types
		if (this._oConditionType && !this._oConditionType._bCreatedByField) {
			this._oConditionType = undefined;
		}
		if (this._oConditionsType && !this._oConditionsType._bCreatedByField) {
			this._oConditionsType = undefined;
		}

		// set types from current content (if external)
		var sEditMode = this.getEditMode();
		var oConditionType;
		var oConditionsType;

		if (this.getContent()) {
			if (this._oContentConditionTypes.content) {
				oConditionType = this._oContentConditionTypes.content.oConditionType;
				oConditionsType = this._oContentConditionTypes.content.oConditionsType;
			}
		} else if (sEditMode === EditMode.Display && this.getContentDisplay()) {
			if (this._oContentConditionTypes.contentDisplay) {
				oConditionType = this._oContentConditionTypes.contentDisplay.oConditionType;
				oConditionsType = this._oContentConditionTypes.contentDisplay.oConditionsType;
			}
		} else if (sEditMode !== EditMode.Display && this.getContentEdit()) {
			if (this._oContentConditionTypes.contentEdit) {
				oConditionType = this._oContentConditionTypes.contentEdit.oConditionType;
				oConditionsType = this._oContentConditionTypes.contentEdit.oConditionsType;
			}
		}

		if (oConditionType) {
			if (this._oConditionType && this._oConditionType._bCreatedByField) {
				this._oConditionType.destroy();
			}
			this._oConditionType = oConditionType;
		}
		if (oConditionsType) {
			if (this._oConditionsType && this._oConditionsType._bCreatedByField) {
				this._oConditionsType.destroy();
			}
			this._oConditionsType = oConditionsType;
		}

		_updateConditionType.call(this);

	}

	function _createInternalContent() {

		_setUsedConditionType.call(this); // if external content use it's conditionType

		var sEditMode = this.getEditMode();
		if (this.getContent() || this._bIsBeingDestroyed ||
				(sEditMode === EditMode.Display && this.getContentDisplay()) ||
				(sEditMode !== EditMode.Display && this.getContentEdit())) {
			_destroyInternalContent.call(this);
			return;
		}

		var sDataType = _getDataTypeName.call(this);
		var oDataTypeConstraints = _getDataTypeConstraints.call(this);
		var oDataTypeFormatOptions = _getDataTypeFormatOptions.call(this);
		var sBaseType = this._oDelegate.getBaseType(this._oPayload, sDataType, oDataTypeFormatOptions, oDataTypeConstraints);
		var iMaxConditions = this.getMaxConditions();
		var oControlType;
		var sControlName;
		var fnCreate;
		var aContentOld = this.getAggregation("_content", []);
		var oContentOld;
		var sControlNameOld;

		if (aContentOld.length > 0) {
			oContentOld = aContentOld[0];
			sControlNameOld = oContentOld.getMetadata().getName().replace(/\./g, "/");
		}

		oControlType = mControlTypes[sBaseType];
		if (!oControlType) {
			// use default
			if (this.getFieldInfo() && this._bTriggerable) {
				oControlType = mControlTypes.Link;
			} else {
				var regexp = new RegExp("^\\*(.*)\\*|\\$search$");
				if (regexp.test(this.getFieldPath()) && this.getMaxConditions() === 1) {
					oControlType = mControlTypes.Search;
				} else {
					oControlType = mControlTypes.Default;
				}
			}
		}

		if (sEditMode === EditMode.Display) {
			sControlName = oControlType.display;
			fnCreate = oControlType.createDisplay;
		} else if (iMaxConditions !== 1) {
			sControlName = oControlType.editMulti;
			fnCreate = oControlType.createEditMulti;
		} else if (this.getMultipleLines()) {
			sControlName = oControlType.editMultiLine;
			fnCreate = oControlType.createEditMultiLine;
		} else {
			sControlName = oControlType.edit;
			fnCreate = oControlType.createEdit;
		}

		if (!sControlName) {
			throw new Error("No control defined for type " + sDataType + " in " + this);
		}

		var aControlNames;
		if (Array.isArray(sControlName)) {
			// multiple controls needed
			aControlNames = sControlName;
			sControlName = aControlNames[0];
		} else {
			aControlNames = [sControlName];
		}

		if (sControlName !== sControlNameOld) {
			this._bHideOperator = false;

			if (oContentOld) {
				_destroyInternalContent.call(this);

				if (oContentOld.isA("sap.m.DateTimeField")) {
					// in case of DatePicker remove type with special format options
					this._initDataType();
				}

				_updateConditionType.call(this);
			}

			var MyControl;
			var i = 0;
			for (i = 0; i < aControlNames.length; i++) {
				var sName = aControlNames[i];
				if (!mControls[sName]) {
					mControls[sName] = {};
				}
				if (!mControls[sName].control) {
					mControls[sName].control = sap.ui.require(sName);
					if (!mControls[sName].control) {
						MyControl = undefined; // at least one control not loaded
					}
				}
				if (i === 0) {
					MyControl = mControls[sName].control;
				}
			}
			if (!MyControl) {
				if (mControls[sControlName].promise) {
					mControls[sControlName].promise.then(_createInternalContent.bind(this));
					return;
				} else {
					mControls[sControlName].promise = new Promise(function(fResolve) {
						mControls[sControlName].resolve = fResolve;
						sap.ui.require(aControlNames, _controlLoaded.bind(this));
					}.bind(this)).then(_createInternalContent.bind(this));
					return;
				}
			}

			var sId = this.getId() + "-inner";
			var aControls = fnCreate.call(this, MyControl, sId);
			for (i = 0; i < aControls.length; i++) {
				var oControl = aControls[i];
				oControl.attachEvent("parseError", _handleParseError, this);
				oControl.attachEvent("validationError", _handleValidationError, this);
				_modifyKeyboardHandler.call(this, oControl);
				_setModelOnContent.call(this, oControl);
				if (this._bConnected && ((i === 0 && !this._bIsMeasure) || (i === 1 && this._bIsMeasure))) {
					_setFocusHandlingForFieldHelp.call(this, oControl);
				}
				this.addAggregation("_content", oControl);
			}
		}
	}

	function _destroyInternalContent() {

		// if the internalContent must be new created the data type must be switched back to original one
		// so new creation of control is using original data
		this.destroyAggregation("_content");

		if (this._oDateOriginalType) {
			this._oDataType = this._oDateOriginalType;
			this._oDateOriginalType = undefined;
		} else if (this._oUnitOriginalType) {
			this._oDataType = this._oUnitOriginalType;
			this._oUnitOriginalType = undefined;
		}

	}

	function _controlLoaded() {

		for (var i = 0; i < arguments.length; i++) {
			var fnControl = arguments[i];
			var sControlName = fnControl.getMetadata().getName();
			sControlName = sControlName.replace(/\./g, "/");
			mControls[sControlName].control = fnControl;
			if (mControls[sControlName].resolve) {
				mControls[sControlName].resolve();
				delete mControls[sControlName].resolve;
			}
		}

	}

	function _setModelOnContent(oContent) {
		oContent.setModel(this._oManagedObjectModel, "$field");
	}

	function _createInputControl(Input, sId) {

		var oConditionsType = _getConditionsType.call(this);
		var oInput = new Input(sId, {
			value: {path: "$field>/conditions", type: oConditionsType},
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}",
			valueStateText: "{$field>/valueStateText}",
			showValueHelp: "{$field>/_fieldHelpEnabled}",
			width: "100%",
			tooltip: "{$field>/tooltip}",
			change: _handleContentChange.bind(this),
			liveChange: _handleContentLiveChange.bind(this),
			valueHelpRequest: _handleValueHelpRequest.bind(this),
			showSuggestion: true	//TODO active suggest to not get the browser history displayed for the input field.
		});

		oInput._setPreferUserInteraction(true);
		_addFieldHelpIcon.call(this, oInput);
		_setAriaLabelledBy.call(this, oInput);
		this._sBoundProperty = "value";

		return [oInput];

	}

	function _createSearchField(SearchField, sId) {

		this._bHideOperator = true;
		var oConditionType = _getConditionType.call(this); // can not bind to conditions directly as SearchField updates "value" while typing
		_updateConditionType.call(this); // to update HideOperator

		var oControl = new SearchField(sId, {
			value: {path: "$field>/conditions/0", type: oConditionType, mode: "OneWay"},
			placeholder: "{$field>/placeholder}",
			width: "100%",
			tooltip: "{$field>/tooltip}",
			search:  _handleContentChange.bind(this)
		});

		_setAriaLabelledBy.call(this, oControl);

		return [oControl];

	}

	function _createMultiInputControl(MultiInput, sId) {

		var Token = sap.ui.require("sap/m/Token"); // is loaded by MultiInput
		var oConditionType = _getConditionType.call(this);
		var oToken = new Token(sId + "-token", {
			text: {
				path: '$field>',
				type: oConditionType }
		});

		var oMultiInput = new MultiInput(sId, {
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}",
			valueStateText: "{$field>/valueStateText}",
			showValueHelp: "{$field>/_fieldHelpEnabled}",
			width: "100%",
			tooltip: "{$field>/tooltip}",
			tokens: {path: "$field>/conditions", template: oToken},
			dependents: [oToken], // to destroy it if MultiInput is destroyed
			change: _handleContentChange.bind(this),
			liveChange: _handleContentLiveChange.bind(this),
			tokenUpdate: _handleTokenUpdate.bind(this),
			valueHelpRequest: _handleValueHelpRequest.bind(this)
		});

		oMultiInput._setPreferUserInteraction(true);
		_addFieldHelpIcon.call(this, oMultiInput);
		_setAriaLabelledBy.call(this, oMultiInput);

		return [oMultiInput];

	}

	function _createTextAreaControl(TextArea, sId) {

		var oConditionsType = _getConditionsType.call(this);
		var oTextArea = new TextArea(sId, {
			value: {path: "$field>/conditions", type: oConditionsType},
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}",
			valueStateText: "{$field>/valueStateText}",
			width: "100%",
			tooltip: "{$field>/tooltip}",
			change: _handleContentChange.bind(this),
			liveChange: _handleContentLiveChange.bind(this)
		});

		oTextArea._setPreferUserInteraction(true);
		_setAriaLabelledBy.call(this, oTextArea);
		this._sBoundProperty = "value";
		return [oTextArea];

	}

	function _createTextControl(Text, sId) {

		var oConditionsType = _getConditionsType.call(this);
		var oText = new Text(sId, {
			text: {path: "$field>/conditions", type: oConditionsType},
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			wrapping: "{$field>/multipleLines}",
			width: "100%",
			tooltip: "{$field>/tooltip}"
		});

		this._sBoundProperty = "text";
		return [oText];
	}

	function _createDatePickerControl(DatePicker, sId) {

		this._bHideOperator = true;
		var oConditionsType = _getConditionsType.call(this);

		_adjustDataTypeForDate.call(this);

		var oDatePicker = new DatePicker(sId, {
			value: {path: "$field>/conditions", type: oConditionsType},
			displayFormat: this._sDisplayFormat,
			valueFormat: this._sValueFormat,
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}", // TODO: own ValueState handling?
			valueStateText: "{$field>/valueStateText}",
			width: "100%",
			tooltip: "{$field>/tooltip}",
			change: _handleContentChange.bind(this)
		});

		if (oDatePicker.setDisplayFormatType) {
			// TimePicker has no displayFormatType
			oDatePicker.setDisplayFormatType(this._sCalendarType);
		}

		oDatePicker._setPreferUserInteraction(true);
		_setAriaLabelledBy.call(this, oDatePicker);
		this._sBoundProperty = "value";
		return [oDatePicker];
	}

	function _createLinkControl(Link, sId) {

		var oFieldInfo = this.getFieldInfo();
		var oConditionsType = _getConditionsType.call(this);
		// do no set width to open the FieldInfo ast the end of the Link
		var oLink = new Link(sId, {
			text: {path: "$field>/conditions", type: oConditionsType},
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			tooltip: "{$field>/tooltip}",
			press: _handleContentPress.bind(this)
		});
		if (oFieldInfo && oFieldInfo.getMetadata().getName() === "sap.ui.mdc.field.FieldInfo") {
			oFieldInfo.getDirectLinkHrefAndTarget().then(function (oLinkItem) {
				if (oLinkItem){
					oLink.setHref(oLinkItem.href);
					oLink.setTarget(oLinkItem.target);
				}
			});
		}

		_setAriaLabelledBy.call(this, oLink);

		this._sBoundProperty = "text";
		return [oLink];
	}

	function _createBoolInputControl(Input, sId) {

		// use default field help
		if (!this.getFieldHelp()) {
			_createDefaultFieldHelp.call(this, "bool");
		}

		return _createInputControl.call(this, Input, sId);

	}

	function _createUnitInputControls(Input, sId) {

		_adjustDataTypeForUnit.call(this);

		this._bIsMeasure = true; // FieldHelp only on unit field
		var oConditionsType = _getConditionsType.call(this);
		var aControls = [];
		var oInput1 = new Input(sId, {
			value: {path: "$field>/conditions", type: oConditionsType},
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}",
			valueStateText: "{$field>/valueStateText}",
			showValueHelp: false,
			width: "70%",
			tooltip: "{$field>/tooltip}",
			change: _handleContentChange.bind(this),
			liveChange: _handleContentLiveChange.bind(this)
		});
		oInput1._setPreferUserInteraction(true);
		_setAriaLabelledBy.call(this, oInput1);
		aControls.push(oInput1);
		aControls = _addUnitControl.call(this, aControls, sId, Input);

		this._sBoundProperty = "value";

		return aControls;

	}

	function _createUnitMultiInputControls(MultiInput, sId) {

		_adjustDataTypeForUnit.call(this);
		this._bIsMeasure = true; // FieldHelp only on unit field

		var Token = sap.ui.require("sap/m/Token"); // is loaded by MultiInput
		var Input = sap.ui.require("sap/m/Input");
		var oConditionType = _getConditionType.call(this);
		var aControls = [];
		var oToken = new Token(sId + "-token", {
			text: {
				path: '$field>',
				type: oConditionType }
		});

		var oFilter =   new Filter({
			path: "values",
			test: function(aValues) {
				// do not show tokens for units without measure
				if (!Array.isArray(aValues[0]) || aValues[0][0]) {
					return true;
				} else {
					return false;
				}
			}
		});

		var oMultiInput = new MultiInput(sId, {
			placeholder: "{$field>/placeholder}",
			textAlign: "{$field>/textAlign}",
			textDirection: "{$field>/textDirection}",
			required: "{$field>/required}",
			editable: { path: "$field>/editMode", formatter: _getEditable },
			enabled: { path: "$field>/editMode", formatter: _getEnabled },
			valueState: "{$field>/valueState}",
			valueStateText: "{$field>/valueStateText}",
			showValueHelp: false,
			width: "70%",
			tooltip: "{$field>/tooltip}",
			tokens: {path: "$field>/conditions", template: oToken, filters: [oFilter]},
			dependents: [oToken], // to destroy it if MultiInput is destroyed
			change: _handleContentChange.bind(this),
			liveChange: _handleContentLiveChange.bind(this),
			tokenUpdate: _handleTokenUpdate.bind(this)
		});
		oMultiInput._setPreferUserInteraction(true);
		_setAriaLabelledBy.call(this, oMultiInput);
		aControls.push(oMultiInput);
		aControls = _addUnitControl.call(this, aControls, sId, Input);

		this._sBoundProperty = "value";

		return aControls;

	}

	function _addUnitControl(aControls, sId, Input) {

		var oUnitConditionsType = _getUnitConditionsType.call(this);

		if (this.getEditMode() === EditMode.EditableDisplay) {
			aControls[0].bindProperty("description", {path: "$field>/conditions", type: oUnitConditionsType});
			aControls[0].setWidth("100%");
			aControls[0].setFieldWidth("70%");
		} else {
			var oInput = new Input(sId + "-unit", {
				value: {path: "$field>/conditions", type: oUnitConditionsType},
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: _getEditableUnit },
				enabled: { path: "$field>/editMode", formatter: _getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: "{$field>/_fieldHelpEnabled}",
				width: "30%",
				tooltip: "{$field>/tooltip}",
				change: _handleContentChange.bind(this),
				liveChange: _handleContentLiveChange.bind(this),
				valueHelpRequest: _handleValueHelpRequest.bind(this)
			});

			oInput._setPreferUserInteraction(true);
			_addFieldHelpIcon.call(this, oInput);
			_setAriaLabelledBy.call(this, oInput);
			aControls.push(oInput);
		}

		return aControls;

	}

	function _modifyKeyboardHandler(oControl) {
		// if FieldHelp is open, do not use native arrow handling of control

		if (oControl.onsapprevious) {
			oControl._origOnsapprevious = oControl.onsapprevious;
			oControl.onsapprevious = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this);
				if (oEvent.keyCode !== KeyCodes.ARROW_UP && (!oFieldHelp || !oFieldHelp.isOpen())) {
					var oControl = this._getContent()[0]; // TODO: multiple content controls
					oControl._origOnsapprevious(oEvent);
				}
			}.bind(this);
		}

		if (oControl.onsapnext) {
			oControl._origOnsapnext = oControl.onsapnext;
			oControl.onsapnext = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this);
				if (oEvent.keyCode !== KeyCodes.ARROW_DOWN && (!oFieldHelp || !oFieldHelp.isOpen())) {
					var oControl = this._getContent()[0]; // TODO: multiple content controls
					oControl._origOnsapnext(oEvent);
				}
			}.bind(this);
		}

		if (oControl.onsapup) {
			oControl._origOnsapup = oControl.onsapup;
			oControl.onsapup = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this);
				if (!oFieldHelp || !oFieldHelp.isOpen()) {
					var oControl = this._getContent()[0]; // TODO: multiple content controls
					oControl._origOnsapup(oEvent);
				}
			}.bind(this);
		}

		if (oControl.onsapdown) {
			oControl._origOnsapdown = oControl.onsapdown;
			oControl.onsapdown = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this);
				if (!oFieldHelp || !oFieldHelp.isOpen()) {
					var oControl = this._getContent()[0]; // TODO: multiple content controls
					oControl._origOnsapdown(oEvent);
				}
			}.bind(this);
		}

		if (oControl.onsapbackspace) {
			oControl._origOnsapbackspace = oControl.onsapbackspace;
			oControl.onsapbackspace = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this);
				if (!oFieldHelp || !oFieldHelp.isOpen()) {
					var oControl = this._getContent()[0]; // TODO: multiple content controls
					oControl._origOnsapbackspace(oEvent);
				}
			}.bind(this);
		}

	}

	function _restoreKeyboardHandler(oControl) {

		if (oControl._origOnsapprevious) {
			oControl.onsapprevious = oControl._origOnsapprevious;
			delete oControl._origOnsapprevious;
		}

		if (oControl._origOnsapnext) {
			oControl.onsapnext = oControl._origOnsapnext;
			delete oControl._origOnsapnext;
		}

		if (oControl._origOnsapup) {
			oControl.onsapup = oControl._origOnsapup;
			delete oControl._origOnsapup;
		}

		if (oControl._origOnsapdown) {
			oControl.onsapdown = oControl._origOnsapdown;
			delete oControl._origOnsapdown;
		}

		if (oControl._origOnsapbackspace) {
			oControl.onsapbackspace = oControl._origOnsapbackspace;
			delete oControl._origOnsapbackspace;
		}

	}

	function _createDefaultFieldHelp(sType) {

		this.setProperty("_fieldHelpEnabled", true, true);
		this._sDefaultFieldHelp = mDefaultHelps[sType].id;

		var oFieldHelp = mDefaultHelps[sType].control;

		if (oFieldHelp && oFieldHelp.bIsDestroyed) {
			// someone destroyed FieldHelp -> initialize
			mDefaultHelps[sType].control = undefined;
			oFieldHelp = undefined;
		}

		if (!oFieldHelp) {
			if (mDefaultHelps[sType].promise) {
				mDefaultHelps[sType].promise.then(_defaultFieldHelpUpdate.bind(this));
			}
			var FieldHelp = sap.ui.require(mDefaultHelps[sType].name);
			if (!FieldHelp && !mDefaultHelps[sType].promise) {
				mDefaultHelps[sType].promise = new Promise(function(fResolve) {
					mDefaultHelps[sType].resolve = fResolve;
					sap.ui.require([mDefaultHelps[sType].name], function(fnControl) {
						_createDefaultFieldHelp.call(this, sType);
					}.bind(this));
				}.bind(this)).then(_defaultFieldHelpUpdate.bind(this));
			}
			if (FieldHelp) {
				oFieldHelp = new FieldHelp(mDefaultHelps[sType].id);
				mDefaultHelps[sType].control = oFieldHelp;
//				this.addDependent(oFieldHelp); // TODO: where to add to control tree
				oFieldHelp.connect(this); // to forward dataType
				if (mDefaultHelps[sType].resolve) {
					mDefaultHelps[sType].resolve();
					delete mDefaultHelps[sType].resolve;
				}
				if (!mDefaultHelps[sType].promise) {
					_defaultFieldHelpUpdate.call(this);
				}
			}
		}

	}

	function _defaultFieldHelpUpdate() {

		_fieldHelpChanged.call(this, "BoolDefaultHelp", "insert");
		_addFieldHelpIcon.call(this, this.getAggregation("_content", [])[0]);

	}

	function _handleParseError(oEvent) {

		// as change event if inner control is fired even Input is wrong, check parse exception from binding
		this._bParseError = true;

	}

	function _handleValidationError(oEvent) {

		// as change event if inner control is fired even Input is wrong, check validation exception from binding
		this._bParseError = true;

		// try to find the corresponding async. change and reject it
		var vValue = oEvent.getParameter("newValue");
		var bFound = false;
		var i = 0;
		for (i = 0; i < this._aAsyncChanges.length; i++) {
			var oChange = this._aAsyncChanges[i];
			if (oChange.waitForUpdate && Array.isArray(oChange.result)) {
				for (var j = 0; j < oChange.result.length; j++) {
					var oCondition = oChange.result[j];
					if (deepEqual(oCondition.values[0], vValue) || (oCondition.operator === "BT" && deepEqual(oCondition.values[1], vValue))) {
						oChange.reject(oEvent.getParameter("exception"));
						bFound = true;
						break;
					}
				}
				if (bFound) {
					break;
				}
			}
		}
		if (bFound) {
			this._aAsyncChanges.splice(i, 1);
		}

	}

	function _handleContentChange(oEvent) {

		var oChangeEvent = {parameters: merge({}, oEvent.getParameters()), source: oEvent.getSource()};
		var iLength = this._aAsyncChanges.length;

		if (iLength > 0 && !this._aAsyncChanges[iLength - 1].changeFired) {
			// as change event in Input is diretly fired after setValue this must be the chnage event corresponding to the last async cahnge.
			// as there might be a sync change after it, do not handle it twice.
			this._aAsyncChanges[iLength - 1].changeFired = true;
			this._aAsyncChanges[iLength - 1].changeEvent = oChangeEvent;
			_triggerChange.call(this, undefined, undefined, undefined, this._aAsyncChanges[iLength - 1].promise);
			return;
		}

		var oChange = {changeEvent: oChangeEvent};

		_performContentChange.call(this, oChange);

	}

	function _performContentChange(oChange) {

		var aConditions = this.getConditions();
		var vValue;
		var bValid = true;
		var vWrongValue;
		var oCondition;
		var oSource = oChange.changeEvent.source;
		var bAsync = false;

		if (oChange.changeEvent.parameters.hasOwnProperty("valid")) {
			bValid = oChange.changeEvent.parameters["valid"];
			if (!bValid && oChange.changeEvent.parameters.hasOwnProperty("value")) {
				vWrongValue = oChange.changeEvent.parameters["value"];
			}
		}

		// use parsed value of the condition, if possible
		var bUpdateConditions = false;
		var oBI = this._sBoundProperty && oSource.getBindingInfo(this._sBoundProperty);
		if (oBI && oBI.binding && oBI.binding.sPath === "/conditions" && bValid) {
			oCondition = aConditions[0];
			vValue = aConditions[0] && aConditions[0].values[0];
		} else if (oChange.changeEvent.parameters.hasOwnProperty("value")) {
			vValue = oChange.changeEvent.parameters["value"];
			if (bValid) {
				bUpdateConditions = true;
			}
		} else if (oChange.changeEvent.parameters.hasOwnProperty("query")) {
			vValue = oChange.changeEvent.parameters["query"];
			bUpdateConditions = true;
		} else {
			oCondition = aConditions[0];
			vValue = aConditions[0] && aConditions[0].values[0];
		}

		if (bUpdateConditions) {
			// text typed in MultiInput
			_removeUIMessage.call(this);
			var oConditionType;
			var oMyChange;

			oCondition = SyncPromise.resolve().then(function() {
				if (this._oNavigateCondition) {
					// text entered via navigation -> use this data, no parsing is needed
					bValid = true;
					return this._oNavigateCondition;
				} else {
					oConditionType = _getConditionType.call(this);
					var vResult = oConditionType.parseValue(vValue);
					var iLength = this._aAsyncChanges.length;

					if (iLength > 0 && !this._aAsyncChanges[iLength - 1].changeFired) {
						oMyChange = this._aAsyncChanges[iLength - 1];
						oMyChange.changeFired = true;
						oMyChange.changeEvent = oChange.changeEvent;
						_triggerChange.call(this, undefined, undefined, undefined, oMyChange.promise);
					}
					return vResult;
				}
			}.bind(this)).then(function(oCondition) {
				_updateConditionsFromChange.call(this, oCondition, aConditions, oConditionType, bValid, vValue, oSource, oMyChange || oChange);
				return oCondition;
			}.bind(this)).catch(function(oException) {
				bValid = false;
				vWrongValue = vValue;
				_setUIMessage.call(this, oException.message);

				if (oMyChange && oMyChange.reject) {
					if (_removeAsyncChange.call(this, oMyChange)) { // only if still valid (might be alredy rejected)
						oMyChange.reject(oException);
					}
				} else if (bAsync) {
					_triggerChange.call(this, aConditions, bValid, vWrongValue );
				}
			}.bind(this)).unwrap();

			if (oCondition instanceof Promise) {
				// will be parsed async
				bAsync = true;
			}
		} else if (!oChange.changeEvent.parameters.hasOwnProperty("valid") && this._bParseError) {
			// this might be result of a value that cannot be parsed
			vWrongValue = oChange.changeEvent.parameters["value"];
			bValid = false;
		}

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && this._bConnected) {
			if (sap.ui.getCore().getCurrentFocusedControlId() === oSource.getId()) {
				oFieldHelp.close(); // if focus is not in field, Field help closes automatically
			}
			oFieldHelp.setFilterValue("");
			if (!bAsync && bValid) {
				_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
				oFieldHelp.onFieldChange();
			}
			if (this.iLiveChangeTimer) {
				// do not trigger async suggestion
				clearTimeout(this.iLiveChangeTimer);
			}
		}

		if (this._oNavigateCondition) {
			this._oNavigateCondition = undefined; // navigation now finished
			_updateConditionType.call(this);
		}

		if (oChange.resolve) {
			// async promise needs to be resolved
			_resolveAsyncChange.call(this, oChange);
		} else if (!bAsync) {
			_triggerChange.call(this, aConditions, bValid, vWrongValue );
		}

	}

	function _updateConditionsFromChange(oCondition, aConditions, oConditionType, bValid, vValue, oSource, oChange) {

		if (oConditionType) {
			// in navigation no validation needed
				oConditionType.validateValue(oCondition);
		}

		var iMaxConditions = this.getMaxConditions();

		if (bValid) {
			if (oCondition) {
				if (this._bIsMeasure && aConditions.length === 1 && aConditions[0].values[0][0] === undefined) {
					// remove empty condition
					aConditions = [];
				}
				if (iMaxConditions !== 1 && Condition.indexOfCondition(oCondition, aConditions) >= 0) {
					// condition already exist (only error if tokens, in SearchField it is OK)
					throw new Error(this._oResourceBundle.getText("field.CONDITION_ALREADY_EXIST", [vValue]));
				} else {
					if (iMaxConditions > 0 && iMaxConditions <= aConditions.length) {
						// remove first conditions to meet maxConditions
						aConditions.splice(0, aConditions.length - iMaxConditions + 1);
					}
					aConditions.push(oCondition);
				}
			} else if (iMaxConditions === 1) {
				aConditions = [];
			}

			if (!deepEqual(aConditions, this.getConditions())) {
				this.setProperty("conditions", aConditions, true); // do not invalidate whole field
			}

			if (iMaxConditions !== 1) {
				oSource.setValue(""); // remove typed value of MultiInput
			}

		}

		if (oChange.resolve) {
			var oFieldHelp = _getFieldHelp.call(this);
			if (oFieldHelp && this._bConnected) {
				_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
				oFieldHelp.onFieldChange();
			}
			oChange.result = aConditions;
			_resolveAsyncChange.call(this, oChange);
			_removeAsyncChange.call(this, oChange);
		}

	}

	function _handleContentLiveChange(oEvent) {

		var vValue;
		var vPreviousValue;
		var bEscPressed = false;
		var oSource = oEvent.getSource();

		this._oNavigateCondition = undefined; // navigation item is not longer valid
		_updateConditionType.call(this);

		if ("value" in oEvent.getParameters()) {
			vValue = oEvent.getParameter("value");
		}

		if ("escPressed" in oEvent.getParameters()) {
			bEscPressed = oEvent.getParameter("escPressed");
		}

		if ("previousValue" in oEvent.getParameters()) {
			vPreviousValue = oEvent.getParameter("previousValue");
		} else {
			var aConditions = this.getConditions();
			vPreviousValue = aConditions[0] && aConditions[0].values[0];
		}

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && oFieldHelp.openByTyping() && (!this._bIsMeasure || oSource.getShowValueHelp())) {
			// TODO: better logic
			var vFilter;
			if (vValue[0] === "=" && vValue[1] === "=") {
				vFilter = vValue.slice(2);
			} else if (vValue[0] === "="/* || vValue[0] === ">" || vValue[0] === "<"*/) {
				vFilter = vValue.slice(1);
			} else {
				vFilter = vValue;
			}

			var sDisplay = this.getDisplay();
			if (sDisplay !== FieldDisplay.Value) {
				// remove "(", ")" from serach string
				// TODO: better solution to search in this case?
				var oOperator = FilterOperatorUtil.getEEQOperator();
				var aParts = oOperator.splitText(vFilter, sDisplay);
				vFilter = "";
				if (aParts[0]) {
					vFilter = aParts[0];
					if (aParts[1]) {
						vFilter = vFilter + " ";
					}
				}
				if (aParts[1]) {
					vFilter = vFilter + aParts[1];
				}
			}

			if (this.iLiveChangeTimer) {
				clearTimeout(this.iLiveChangeTimer);
				delete this.iLiveChangeTimer;
			}

			this.iLiveChangeTimer = setTimeout(function() {
				if (this._bConnected && this._getContent()[0] &&
						(sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[0].getId() ||
						(this._getContent()[1] && sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[1].getId()))) { // only if still connected and focussed
					oFieldHelp.setFilterValue(vFilter);
					if (oFieldHelp.getConditions().length > 0) {
						// While suggestion no item is selected
						oFieldHelp.setConditions([]);
					}
					oFieldHelp.open(true);
				}
			}.bind(this), 300);

		}

		this.fireLiveChange({ value: vValue, escPressed: bEscPressed, previousValue: vPreviousValue});

	}

	function _handleContentPress(oEvent) {

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			oFieldInfo.getTriggerHref().then(function (sHref) {
				if (!sHref){
					oFieldInfo.open(this._getContent()[0]);
				}
			}.bind(this));
		}

		this.firePress();

	}

	function _handleTokenUpdate(oEvent) {

		if (oEvent.getParameter("type") === "removed") {
			var aRemovedTokens = oEvent.getParameter("removedTokens");
			var aConditions = this.getConditions();
			var sUnit;
			var i;

			for (i = 0; i < aRemovedTokens.length; i++) {
				var oRemovedToken = aRemovedTokens[i];
				var sPath = oRemovedToken.getBindingContext("$field").sPath;
				var iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
				aConditions[iIndex].delete = true;
			}

			for (i = aConditions.length - 1; i >= 0; i--) {
				if (aConditions[i].delete) {
					if (this._bIsMeasure) {
						sUnit = aConditions[i].values[0][1];
					}
					aConditions.splice(i, 1);
				}
			}

			if (this._bIsMeasure && sUnit && aConditions.length === 0) {
				// create dummy condition for unit
				aConditions = [Condition.createItemCondition([undefined, sUnit], undefined)];
			}

			this.setProperty("conditions", aConditions, true); // do not invalidate whole field
			_triggerChange.call(this, aConditions, true );
			oEvent.preventDefault(true);
		}

	}

	function _fieldHelpChanged(sId, sMutation) {

		var oFieldHelp = sap.ui.getCore().byId(sId);

		if (sMutation === "remove") {
			oFieldHelp.detachEvent("select", _handleFieldHelpSelect, this);
			oFieldHelp.detachEvent("navigate", _handleFieldHelpNavigate, this);
			oFieldHelp.detachEvent("dataUpdate", _handleHelpDataUpdate, this);
			oFieldHelp.detachEvent("disconnect", _handleDisconnect, this);
			this.setProperty("_fieldHelpEnabled", false, true);
		} else if (sMutation === "insert") {
			if (oFieldHelp) {
				oFieldHelp.attachEvent("dataUpdate", _handleHelpDataUpdate, this);
				this.setProperty("_fieldHelpEnabled", true, true);
			}
		}

		_handleConditionsChange.call(this, this.getConditions()); // to update descriptions

	}

	function _getFieldHelp() {

		var sId = this.getFieldHelp();
		var oFieldHelp;

		if (!sId && this._sDefaultFieldHelp) {
			sId = this._sDefaultFieldHelp;
		}

		if (sId) {
			oFieldHelp = sap.ui.getCore().byId(sId);
		}

		return oFieldHelp;

	}

	function _setConditionsOnFieldHelp(aConditions, oFieldHelp) {

		if (!oFieldHelp) {
			oFieldHelp = _getFieldHelp.call(this);
		}

		if (this._bIsMeasure) {
			// for unit or curreny add only the unit/currency to FieldHelp
			var aHelpConditions = [];
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.values[0] && oCondition.values[0][1]) {
					var oHelpCondition = Condition.createItemCondition(oCondition.values[0][1], undefined, oCondition.inParameters, oCondition.outParameters);
					aHelpConditions.push(oHelpCondition);
				}
			}
			oFieldHelp.setConditions(aHelpConditions);
		} else {
			oFieldHelp.setConditions(aConditions);
		}

	}

	function _handleValueHelpRequest(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp) {
			oFieldHelp.setFilterValue("");
			var aConditions = this.getConditions();
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
			oFieldHelp.toggleOpen(false);
		}

	}

	function _handleFieldHelpSelect(oEvent) {

		var aConditions = this.getConditions();
		var aNewConditions = oEvent.getParameter("conditions");
		var bAdd = oEvent.getParameter("add");
		var oFieldHelp = oEvent.oSource;
		var iMaxConditions = this.getMaxConditions();
		var oCondition;
		var oContent = this.getControlForSuggestion();
		var sDOMValue;
		var i = 0;

		if (this._bIsMeasure) {
			if (aNewConditions.length > 1) {
				throw new Error("Only one item must be selected! " + this);
			}
			if (aNewConditions[0].operator !== "EEQ") {
				throw new Error("Only EEQ allowed! " + this);
			}

			if (aConditions.length > 0) {
				// TODO: update all conditions?
				for (i = 0; i < aConditions.length; i++) {
					aConditions[i].values[0][1] = aNewConditions[0].values[0];
					if (aConditions[i].operator === "BT") {
						aConditions[i].values[1][1] = aNewConditions[0].values[0];
					}
					if (aNewConditions[0].inParameters) {
						aConditions[i].inParameters = aNewConditions[0].inParameters;
					}
					if (aNewConditions[0].outParameters) {
						aConditions[i].outParameters = aNewConditions[0].outParameters;
					}
				}
			} else {
				oCondition = merge({}, aNewConditions[0]); // use selected condition to keep in/out parameter
				oCondition.values[0] = [undefined, oCondition.values[0]];
				oCondition.values[1] = undefined;
				aConditions.push(oCondition);
				// TODO: format once to update current value in type (as empty condtions are not displayed as token)
				if (this._oConditionType) {
					sDOMValue = this._oConditionType.formatValue(oCondition);
				} else if (this._oConditionsType) {
					sDOMValue = this._oConditionsType.formatValue(aConditions);
				}
			}
		} else {
			if (!bAdd) {
				aConditions = []; // remove all existing conditions
			}

			for (i = 0; i < aNewConditions.length; i++) {
				oCondition = aNewConditions[i];
				if (!_isValidOperator.call(this, oCondition.operator)) {
					continue;
				}

				// take what ever comes from field help as valid - even if it is an empty key
				// TODO: what if field is required?

				if (!bAdd || Condition.indexOfCondition(oCondition, aConditions) === -1) { // check if already exist
					aConditions.push(oCondition);
				}
			}
		}

		if (iMaxConditions > 0 && iMaxConditions < aConditions.length) {
			// remove first conditions to meet maxConditions
			aConditions.splice(0, aConditions.length - iMaxConditions);
		}

		if (oContent && oContent.setDOMValue) {
			if (this.getMaxConditionsForHelp() === 1 && aConditions.length > 0) {
				// the focus is still in the Field. The update of the inner control is done via ManagedObjectModel binding.
				// The inner Input is configured to prefer user input in this case.
				// so we need to set the DOM value here. Otherwise it is not updated or, if empty, selected.
				if (this._bIsMeasure && this._oUnitConditionsType) {
					sDOMValue = this._oUnitConditionsType.formatValue(aConditions);
				} else if (this._oConditionType) {
					sDOMValue = this._oConditionType.formatValue(aConditions[0]);
				} else if (this._oConditionsType) {
					sDOMValue = this._oConditionsType.formatValue(aConditions);
				}
				oContent.setDOMValue(sDOMValue);
			} else {
				// remove typed value from MultiInput
				oContent.setDOMValue("");
			}
		}

		if (!deepEqual(aConditions, this.getConditions())) {
			this._oNavigateCondition = undefined;
			_updateConditionType.call(this);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole field

			// handle out-parameters
			oFieldHelp.onFieldChange();

			_triggerChange.call(this, aConditions, true);
		}

	}

	function _handleFieldHelpNavigate(oEvent) {

		var sValue = oEvent.getParameter("value");
		var vKey = oEvent.getParameter("key");
		var oCondition = oEvent.getParameter("condition");
		var sNewValue;
		var sDOMValue;
		var oContent = this.getControlForSuggestion();

		if (oCondition) {
			this._oNavigateCondition = merge({}, oCondition);
			vKey = oCondition.values[0];
			sValue = oCondition.values[1];
		} else {
			this._oNavigateCondition = Condition.createItemCondition(vKey, sValue);
		}

		if (this._bIsMeasure) {
			var aConditions = this.getConditions();
			// use number of first condition. In Multicase all conditions must be updated in change event
			if (aConditions.length > 0) {
				this._oNavigateCondition.operator = aConditions[0].operator;
				this._oNavigateCondition.values[0] = [aConditions[0].values[0][0], this._oNavigateCondition.values[0]];
				if (aConditions[0].operator === "BT") {
					this._oNavigateCondition.values[1] = [aConditions[0].values[1][0], this._oNavigateCondition.values[0][1]];
				} else {
					this._oNavigateCondition.values[1] = undefined;
				}
			} else {
				this._oNavigateCondition.values = [[undefined, this._oNavigateCondition.values[0]], undefined];
			}
		}

		_updateConditionType.call(this);

		// take what ever comes from field help as valid - even if it is an empty key
		// TODO: what if field is required?

		if (this.getDisplay() !== FieldDisplay.Value) {
			// value is used as key
			sNewValue = vKey;
		} else if (sValue) {
			sNewValue = sValue;
		} else {
			sNewValue = vKey;
		}

		if (oContent && oContent.setDOMValue) {
			if (!sDOMValue) {
				if (this._bIsMeasure && this._oUnitConditionsType && this._oNavigateCondition) {
					sDOMValue = this._oUnitConditionsType.formatValue([this._oNavigateCondition]);
				} else if (this._oConditionType && this._oNavigateCondition) {
					sDOMValue = this._oConditionType.formatValue(this._oNavigateCondition);
				} else if (this._oConditionsType && this._oNavigateCondition) {
					sDOMValue = this._oConditionsType.formatValue([this._oNavigateCondition]);
				} else {
					sDOMValue = sValue || vKey;
				}
			}
			oContent.setDOMValue(sDOMValue);
			oContent._doSelect();
		}

		this.fireLiveChange({value: sNewValue});

	}

	function _handleHelpDataUpdate(oEvent) {

		var isEditing = this.getEditMode() === EditMode.Editable && this._getContent().length > 0 &&
			sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[0].getId();

//		// also in display mode to get right text
//		_handleConditionsChange.call(this, this.getConditions());
		if (!isEditing && this.getConditions().length > 0 &&
				(this.getMaxConditions() !== 1 || (this.getDisplay() !== FieldDisplay.Value && !this._bParseError))) {
			// update tokens in MultiValue
			// update text/value only if no parse error, otherwise wrong value would be removed
			this._oManagedObjectModel.checkUpdate(true);
		}

	}

	function _handleDisconnect(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);
		oFieldHelp.detachEvent("select", _handleFieldHelpSelect, this);
		oFieldHelp.detachEvent("navigate", _handleFieldHelpNavigate, this);
		oFieldHelp.detachEvent("disconnect", _handleDisconnect, this);
		this._bConnected = false;

	}

	function _connectFieldhelp() {

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && !this._bConnected) {
			oFieldHelp.connect(this);
			this._bConnected = true;
			oFieldHelp.attachEvent("select", _handleFieldHelpSelect, this);
			oFieldHelp.attachEvent("navigate", _handleFieldHelpNavigate, this);
			oFieldHelp.attachEvent("disconnect", _handleDisconnect, this);
			var aConditions = this.getConditions();
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);

			var oContent = this.getControlForSuggestion();
			_setFocusHandlingForFieldHelp.call(this, oContent);
		}

	}

	function _setFocusHandlingForFieldHelp(oContent) {

		if (oContent && !oContent.orgOnsapfocusleave && oContent.onsapfocusleave) {
			//TODO: find better solution
			oContent.orgOnsapfocusleave = oContent.onsapfocusleave;
			oContent.onsapfocusleave = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this.getParent());

				if (oFieldHelp) {
					var oFocusedControl = sap.ui.getCore().byId(oEvent.relatedControlId);
					if (oFocusedControl) {
						if (containsOrEquals(oFieldHelp.getDomRef(), oFocusedControl.getFocusDomRef())) {
							oEvent.stopPropagation();
							return;
						} else {
							oFieldHelp.skipOpening();
						}
					}
				}
				this.orgOnsapfocusleave(oEvent);
			};
		}

	}

	// TODO: need API on Input
	function _addFieldHelpIcon(oControl) {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp && oControl && oControl.addEndIcon) {
			var sIconName = oFieldHelp.getIcon();
			var oIcon = oControl.getAggregation("_endIcon", [])[0];

			if (oIcon) {
				oIcon.setSrc(sIconName);
			} else {
				oControl.addEndIcon({
					id: oControl.getId() + "-vhi",
					src: sIconName,
					useIconTooltip: false,
					noTabStop: true,
					press: function (oEvent) {
						// if the property valueHelpOnly is set to true, the event is triggered in the ontap function
						if (!this.getValueHelpOnly()) {
							var $input;

							if (Device.support.touch) {
								// prevent opening the soft keyboard
								$input = this.$('inner');
								$input.attr('readonly', 'readonly');
								this.focus();
								$input.removeAttr('readonly');
							} else {
								this.focus();
							}

							this.bValueHelpRequested = true;
							this.fireValueHelpRequest({ fromSuggestions: false });
						}
					}.bind(oControl)
				});
			}
		}

	}

	function _fieldInfoChanged(oFieldInfo, sMutation) {

		if (sMutation === "remove") {
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		} else if (sMutation === "insert") {
			oFieldInfo.attachEvent("dataUpdate", _handleInfoDataUpdate, this);
			_handleInfoDataUpdate.call(this); // to set already existing values
		}

	}

	function _handleInfoDataUpdate() {

		var oFieldInfo = this.getFieldInfo();
		var that = this;
		oFieldInfo.isTriggerable().then(function (bTriggerable) {
			that._bTriggerable = bTriggerable;
			if (that.getAggregation("_content", []).length > 0 && that.getEditMode() === EditMode.Display) {
				_createInternalContent.call(that);
				oFieldInfo.getDirectLinkHrefAndTarget().then(function (oLinkItem) {
					that.getAggregation("_content")[0].setHref(oLinkItem.href);
					that.getAggregation("_content")[0].setTarget(oLinkItem.target);
				});
			}
		});

	}

	// also needed on FieldHelp to format tokens....
	FieldBase.prototype._getFormatOptions = function() {

		if (!this._asyncParsingCall) {
			this._asyncParsingCall = _asyncParsingCall.bind(this); //as variable to have the same function after each update of formatOptions. Otherwise it would be a change on FormatOption in ValueHelpPanel every time
		}

		return {
				valueType: _getDataType.call(this),
				originalDateType: this._oDateOriginalType || this._oUnitOriginalType,
				display: this._bIsMeasure ? FieldDisplay.Value : this.getDisplay(),
				fieldHelpID: this._bIsMeasure ? undefined : this.getFieldHelp() || this._sDefaultFieldHelp,
				operators: this._getOperators(),
				hideOperator: this._bHideOperator,
				maxConditions: this.getMaxConditions(),
				bindingContext: this.getBindingContext(), // to dertmine text and key usding in/out-parameter using correct bindingContext (In Table FieldHelp might be connected to other row)
				asyncParsing: this._asyncParsingCall,
				navigateCondition: this._oNavigateCondition,
				delegate: this._oDelegate,
				payload: this._oPayload
			};

	};

	function _updateConditionType() {

		if (this._oConditionType || this._oConditionsType) {
			var oFormatOptions = this._getFormatOptions();
			if (this._oConditionType) {
				this._oConditionType.setFormatOptions(oFormatOptions);
			}
			if (this._oConditionsType) {
				this._oConditionsType.setFormatOptions(oFormatOptions);
			}
			if (this._oUnitConditionsType) {
				oFormatOptions = _getUnitFormatOptions.call(this);
				this._oUnitConditionsType.setFormatOptions(oFormatOptions);
			}
		}

	}

	function _getConditionType() {

		if (!this._oConditionType) {
			this._oConditionType = new ConditionType();
			this._oConditionType._bCreatedByField = true;
			_updateConditionType.call(this);
		}

		return this._oConditionType;

	}

	function _getConditionsType() {

		if (!this._oConditionsType) {
			this._oConditionsType = new ConditionsType();
			this._oConditionsType._bCreatedByField = true;
			_updateConditionType.call(this);
		}

		return this._oConditionsType;

	}

	/*
	 * If the value is the initial value of the type (String types) and
	 * the Field not shows tokens or operator (Field case) no condition
	 * must be set as the field then is empty.
	 */
	FieldBase.prototype._checkValueInitial = function(vValue) {

		if (vValue === null || vValue === undefined) {
			return true;
		}

		if (vValue === "") {
			var oType = _getDataType.call(this);
			var vResult = oType.parseValue(vValue, "string");
			if (vResult === vValue) {
				return true; // it's initial value
			} else {
				try {
					oType.validateValue(vResult);
				} catch (oError) {
					// if type is not nullable empty is invalid, so it is initial
					return true;
				}
			}
		} else {
			var sDataType = _getDataTypeName.call(this);
			if (this._oDelegate.getBaseType(this._oPayload, sDataType) === BaseType.Unit
				&& Array.isArray(vValue) && vValue.length > 1 && (vValue[0] === undefined || vValue[0] === null) && !vValue[1]) { // as 0 is a valid number
				//no number and no unit -> initial
				return true;
			}
		}

		// TODO: other types?

		return false;

	};

	function _getUnitConditionsType() {

		if (!this._oUnitConditionsType) {
			var oFormatOptions = _getUnitFormatOptions.call(this);
			this._oUnitConditionsType = new ConditionsType(oFormatOptions);
			this._oUnitConditionsType._bCreatedByField = true;
		}

		return this._oUnitConditionsType;

	}

	function _getUnitFormatOptions() {

		if (!this._asyncParsingCall) { //as variable to have the same function after each update of formatOptions. Otherwise it would be a change on FormatOption in ValueHelpPanel every time
			this._asyncParsingCall = _asyncParsingCall.bind(this);
		}

		return {
			valueType: undefined, // use String as default
			originalDateType: _getDataType.call(this), // use type of measure for currentValue
			display: this.getDisplay(),
			fieldHelpID: this.getFieldHelp() || this._sDefaultFieldHelp,
			operators: ["EEQ"],
			hideOperator: true, // TODO: no operator for units
			maxConditions: 1, // TODO: only one unit allowed
			bindingContext: this.getBindingContext(), // to dertmine text and key usding in/out-parameter using correct bindingContext (In Table FieldHelp might be connected to other row)
			asyncParsing: this._asyncParsingCall,
			navigateCondition: this._oNavigateCondition,
			delegate: this._oDelegate,
			payload: this._oPayload,
			isUnit: true,
			getConditions: this.getConditions.bind(this) // TODO: better solution to update unit in all conditions
		};

	}

	function _asyncParsingCall(oPromise) {

		// close FieldHelp to prevent action on it during parsing (only if still focused, otherwise let autoclose do its work)
		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && oFieldHelp.isOpen()) {
			var oFocusedElement = document.activeElement;
			if (oFocusedElement
					&& (containsOrEquals(this.getDomRef(), oFocusedElement) || containsOrEquals(oFieldHelp.getDomRef(), oFocusedElement))) {
				oFieldHelp.close();
			}
		}

		// as async parsing can be called again while one is still running we have to map the promises to resolve the right one.
		var oChange = {};
		var oMyPromise = new Promise(function(fResolve, fReject) {
			oChange.resolve = fResolve;
			oChange.reject = fReject;

			oPromise.then(function(vResult) {// vResult can be a condition or an array of conditions
				oChange.result = vResult;
				var aConditions = this.getConditions();
				if (deepEqual(vResult, aConditions)) {
					// parsingResult is same as current value -> no update will happen
					_resolveAsyncChange.call(this, oChange);
					_removeAsyncChange.call(this, oChange);
				} else {
					oChange.waitForUpdate = true;
				}
			}.bind(this)).catch(function(oException) {
				this._bParseError = true;
				fReject(oException);
				_removeAsyncChange.call(this, oChange);
			}.bind(this));
		}.bind(this));

		oChange.promise = oMyPromise;
		this._aAsyncChanges.push(oChange);

	}

	FieldBase.prototype._getResultForPromise = function(aConditions) {

		// to be overwritten by Field - per default resolve conditions
		return aConditions;

	};

	function _resolveAsyncChange(oChange) {

		oChange.resolve(this._getResultForPromise(oChange.result));

	}

	function _removeAsyncChange(oChange) {

		var bFound = false;
		var i = 0;
		for (i = 0; i < this._aAsyncChanges.length; i++) {
			if (oChange === this._aAsyncChanges[i]) {
				bFound = true;
				break;
			}
		}
		if (bFound) {
			this._aAsyncChanges.splice(i, 1);
		}

		return bFound;

	}

	function _loadDelegate(oDelegate) {

		if (this._oDelegate || this._oDelegateLoading) {
			throw new Error("Delegate can only be set once");
		}

		// make sync if already loaded
		this._oDelegate = sap.ui.require(oDelegate.name);
		this._oPayload = oDelegate.payload || {};

		if (this._oDelegate) {
			this._oDelegateResolve();
			delete this._oDelegateResolve;
			delete this._oDelegateReject;
		} else {
			this._oDelegateLoading = true;
			sap.ui.require([oDelegate.name], function(fnDelegate) {
				this._oDelegate = fnDelegate;
				this._oDelegateResolve();
				delete this._oDelegateResolve;
				delete this._oDelegateReject;
				delete this._oDelegateLoading;
			}.bind(this), function() {
				this._oDelegateReject("Failed to load delegate");
				delete this._oDelegateResolve;
				delete this._oDelegateReject;
				delete this._oDelegateLoading;
			}.bind(this));
		}

	}

	/*
	 * returns the supported operators
	 *
	 * To be overwritten by Field and FilterField
	 */
	FieldBase.prototype._getOperators = function() {

		// get default operators for type
		var sDataType = _getDataTypeName.call(this);
		var oConstraints = _getDataTypeConstraints.call(this);
		var oFormatOptions = _getDataTypeFormatOptions.call(this);
		var sBaseType = this._oDelegate.getBaseType(this._oPayload, sDataType, oFormatOptions, oConstraints); // TODO what if delegate not loaded

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return FilterOperatorUtil.getOperatorsForType(sBaseType);

	};

	/*
	 * checks is a operator is valid
	 *
	 * If only EEQ, EQ is also valid. If only EQ, EEQ is also valid.
	 */
	function _isValidOperator(sOperator) {

		var aOperators = this._getOperators();

		for (var i = 0; i < aOperators.length; i++) {
			if (sOperator === aOperators[i]) {
				return true;
			}
			if (sOperator === "EQ" && aOperators[i] === "EEQ") {
				return true;
			}
			if (sOperator === "EEQ" && aOperators[i] === "EQ") {
				return true;
			}
		}

		return false;

	}

	return FieldBase;

});
