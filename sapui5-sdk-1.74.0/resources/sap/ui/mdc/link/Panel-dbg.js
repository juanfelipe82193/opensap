/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/XMLComposite',
	'sap/ui/mdc/library',
	'sap/m/HBox',
	'sap/m/VBox',
	'sap/m/Text',
	'sap/m/Image',
	'sap/m/Link',
	'sap/ui/mdc/link/ILinkHandler',
	'sap/ui/core/CustomData',
	'sap/base/Log',
	'sap/m/SelectDialog',
	'sap/m/StandardListItem',
	'sap/ui/mdc/link/SelectionDialog',
	'sap/ui/mdc/link/SelectionDialogItem',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/BindingMode',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/flexibility/PanelItem.flexibility',
	'sap/ui/mdc/flexibility/Panel.flexibility'
], function(XMLComposite, mdcLibrary, HBox, VBox, Text, Image, Link, ILinkHandler, CustomData, Log, SelectDialog, StandardListItem, SelectionDialog, SelectionDialogItem, JSONModel, BindingMode, ManagedObjectObserver, PanelItemFlexibility, PanelFlexibility) {
	"use strict";

	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Panel control is used to show <code>items</code> and <code>additionalContent</code>. After providing of the <code>items</code> it is
	 * supposed that the properties of the item structure is not changed.
	 * @extends sap.ui.mdc.XMLComposite
	 * @author SAP SE
	 * @version 1.74.0
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.link.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = XMLComposite.extend("sap.ui.mdc.link.Panel", /** @lends sap.ui.mdc.link.Panel.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/link/Panel.designtime",
			defaultAggregation: "items",
			properties: {
				/**
				 * As the Panel control does not know whether items aggregation is filled completely, the user of the control has
				 * to define the visibility of the personalization button.
				 */
				enablePersonalization: {
					type: "boolean",
					defaultValue: true,
					invalidate: true
				},
				/**
				 * Path to the helper object which is responsible for metadata providing.
				 */
				metadataHelperPath: {
					type: "string"
				}
			},
			aggregations: {
				/**
				 * Defines items.
				 * Items which are filled at the beginning (meaning before the selection dialog is opened) are considered as the baseline items.
				 */
				items: {
					type: "sap.ui.mdc.link.PanelItem",
					multiple: true,
					singularName: "item"
				},
				/**
				 * In addition to main item and items some additional content can be displayed in the panel.
				 */
				additionalContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						idSuffix: "--idSectionAdditionalContent",
						aggregation: "items"
					}
				}
			},
			events: {
				/**
				 * This event is fired before selection dialog is opened.
				 */
				beforeSelectionDialogOpen: {},
				/**
				 * This event is fired after selection dialog is closed.
				 */
				afterSelectionDialogClose: {}
			}
		}
	});
	Panel.prototype.init = function() {
		XMLComposite.prototype.init.call(this);
		var oModel = new JSONModel({
			// disjunct sets
			countMainItems: 0,
			countNonMainItemsWithIcon: 0,
			countNonMainItemsWithoutIcon: 0,

			showResetEnabled: false,

			// Additionally the property 'icon' can be modified in 'runtimeItems'.
			runtimeItems: []
		});
		oModel.setDefaultBindingMode(BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdcbaseinfoPanel");

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			properties: [
				"enablePersonalization"
			],
			aggregations: [
				"items"
			]
		});
	};
	Panel.prototype.exit = function(oControl) {
		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver = null;
		}
	};

	Panel.prototype.onPressLinkPersonalization = function() {
		this.openSelectionDialog(false, true, undefined);
	};
	Panel.prototype.openSelectionDialog = function(bForbidNavigation, bShowReset, sStyleClass) {
		return sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			sap.ui.require([
				'sap/ui/fl/write/api/ControlPersonalizationWriteAPI', 'sap/ui/fl/apply/api/FlexRuntimeInfoAPI', 'sap/ui/fl/Utils', this.getMetadataHelperPath() || "sap/ui/mdc/link/ContentHandler"
			], function(ControlPersonalizationWriteAPI, FlexRuntimeInfoAPI, Utils, MetadataHelper) {

				// If the condition, that a control is assigned to a AppComponent is not fulfilled, we can go ahead
				if (!FlexRuntimeInfoAPI.isFlexSupported({element: this})) {
					Log.error("No AppComponent fount for control " + this + ". Without AppComponent the personalization is not available.");
					return Promise.resolve();
				}
				// Otherwise we wait until the changes are applied
				return FlexRuntimeInfoAPI.waitForChanges({element: this}).then(function() {

					return new Promise(function(resolve) {
						// Do not show main item in the selection dialog
						var aAllItemsWithoutMain = MetadataHelper.retrieveAllMetadata(this).filter(function(oMetadataItem) {
							return oMetadataItem.isMain !== true;
						});
						if (!aAllItemsWithoutMain.length) {
							aAllItemsWithoutMain = jQuery.extend(true, [], this._getInternalModel().getProperty("/runtimeItems")).filter(function(oMItem) {
								return oMItem.isMain !== true;
							});
						}
						var bShowDefaultIcon = aAllItemsWithoutMain.some(function(oMItem) {
							return !!oMItem.icon;
						});
						var aMItemsRuntimeWithoutMain = jQuery.extend(true, [], this._getInternalModel().getProperty("/runtimeItems")).filter(function(oMItem) {
							return oMItem.isMain !== true;
						});

						var fnCleanUp = function(oSelectionDialog) {
							oSelectionDialog.close();
							oSelectionDialog.destroy();
							this.fireAfterSelectionDialogClose();
						}.bind(this);
						var aRuntimeChanges = [];
						var fnAddRuntimeChange = function(sId, bVisible) {
							aRuntimeChanges.push({
								id: sId,
								visible: bVisible
							});
						};

						this.fireBeforeSelectionDialogOpen();

						var oSelectionDialog = new SelectionDialog({
							showItemAsLink: !bForbidNavigation,
							// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
							showReset: false,
							// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
							// showResetEnabled: {
							// 	path: '$selectionDialog>/showResetEnabled'
							// },
							items: aAllItemsWithoutMain.map(function(oMItem) {
								// Overwrite metadata with the current values
								var oMItemRuntime = Panel._getItemById(oMItem.id, aMItemsRuntimeWithoutMain);
								var sIcon = oMItem.icon;
								if (bShowDefaultIcon && !sIcon) {
									sIcon = "sap-icon://chain-link";
								}
								return new SelectionDialogItem({
									key: oMItem.id, // convert id to key
									text: oMItem.text,
									description: oMItem.description,
									href: oMItem.href,
									target: oMItem.target,
									icon: sIcon,
									visible: oMItemRuntime ? oMItemRuntime.visible : false
								});
							}),
							visibilityChanged: function(oEvent) {
								var oView = Utils.getViewForControl(this);
								// convert key to id
								var sId = oView.createId(oEvent.getParameter("key"));
								fnAddRuntimeChange(sId, oEvent.getParameter("visible"));
							}.bind(this),
							ok: function() {
								fnCleanUp(oSelectionDialog);

								var aPanelChanges = PanelFlexibility.createChanges(this, aRuntimeChanges);

								var aFlexChangesTotal = [];
								// First create a new item instance
								ControlPersonalizationWriteAPI.add({
									changes: aPanelChanges,
									ignoreVariantManagement: true
								}).then(function(aFlexChanges) {
									aFlexChangesTotal = aFlexChangesTotal.concat(aFlexChanges);
									// Then use the new item instance as selector control
									var aPanelItemChanges = PanelItemFlexibility.createChanges(aRuntimeChanges);
									return ControlPersonalizationWriteAPI.add({
										changes: aPanelItemChanges,
										ignoreVariantManagement: true
									});
								}).then(function(aFlexChanges) {
									aFlexChangesTotal = aFlexChangesTotal.concat(aFlexChanges);
									return ControlPersonalizationWriteAPI.save({
										selector: this,
										changes: aFlexChangesTotal
									});
								}.bind(this)).then(function() {
									return resolve(true);
								});
							}.bind(this),
							cancel: function() {
								fnCleanUp(oSelectionDialog);
								return resolve(true);
							},
							reset: function() {
								// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
							}
						});
						if (sStyleClass) {
							oSelectionDialog.addStyleClass(sStyleClass);
						}
						// TODO: reset is currently not supported. We are waiting for delivery of Flex regarding reset functionality
						// this._getInternalModel().setProperty("/showResetEnabled", !Panel._isEqual(aMBaselineItemsTotal, Panel._convertSelectionDialogItems2MItems(oSelectionDialog.getItems())));

						// toggle compact style
						jQuery.sap.syncStyleClass("sapUiSizeCompact", this, oSelectionDialog);
						oSelectionDialog.setModel(this._getInternalModel(), "$selectionDialog");
						this.addDependent(oSelectionDialog);

						oSelectionDialog.open();

					}.bind(this));
				}.bind(this));

			}.bind(this));
		}.bind(this));
	};

	Panel._getArrayElementById = function(sId, aArray) {
		var aElements = aArray.filter(function(oElement) {
			return oElement.id !== undefined && oElement.id === sId;
		});
		return aElements.length ? aElements[0] : null;
	};
	Panel._getItemById = function(sId, aArray) {
		return aArray.filter(function(oMElement) {
			return oMElement.id === sId;
		})[0];
	};
	Panel._getDiffToBase = function(aMBaseItems, aMItems) {
		if (!aMItems || !aMBaseItems || aMBaseItems.length !== aMItems.length) {
			return false;
		}
		return aMItems.filter(function(oMItem) {
			var oMBaseItem = Panel._getItemById(oMItem.id, aMBaseItems);
			return oMItem.id !== oMBaseItem.id || oMItem.visible !== oMBaseItem.visible;
		});
	};
	Panel._convertSelectionDialogItems2MItems = function(aSelectionDialogItems) {
		return aSelectionDialogItems.map(function(oSelectionDialogItem) {
			return {
				id: oSelectionDialogItem.getKey(),
				visible: oSelectionDialogItem.getVisible()
			};
		});
	};
	// Panel._isEqual = function(aMBaselineItemsTotal, aMItems) {
	// 	var aMItemsTotal = Panel._getUnion(aMBaselineItemsTotal, aMItems);
	// 	return Panel._getDiffToBase(aMItemsTotal, aMBaselineItemsTotal).length === 0;
	// };
	Panel._getUnion = function(aMBaselineItems, aMItems) {
		if (!aMItems) {
			return jQuery.extend(true, [], aMBaselineItems);
		}
		var aUnion = jQuery.extend(true, [], aMItems);
		aMBaselineItems.forEach(function(oMItemBase) {
			var oMItemUnion = Panel._getItemById(oMItemBase.id, aUnion);
			if (!oMItemUnion) {
				aUnion.push(oMItemBase);
				return;
			}
			if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
				oMItemUnion.visible = oMItemBase.visible;
			}
		});
		return aUnion;
	};
	Panel.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdcbaseinfoPanel");
	};
	Panel.prototype._propagateDefaultIcon = function(bShowDefaultIcon) {
		// If at least one item has an icon, except the main item, we have to set a default icon for the items which do not have an icon
		// Once the defaultIcon has been set, it can not be reverted (to false)
		if (!bShowDefaultIcon) {
			return;
		}
		var oModel = this._getInternalModel();
		oModel.getProperty("/runtimeItems").forEach(function(oMItem, iIndex) {
			if (oMItem.isMain === true || !!oMItem.icon) {
				return;
			}
			// Note: due to this enhancement of default icon, depending on isMain property, we have to use internal
			// JSON model $sapuimdcbaseinfoPanel>/runtimeItems in the Panel.control.xml. Without this enhancement
			// we could just use $this instead.
			oModel.setProperty("/runtimeItems/" + iIndex + "/icon", "sap-icon://chain-link");
		});
	};

	function _observeChanges(oChanges) {
		var oModel = this._getInternalModel();
		if (oChanges.object.isA("sap.ui.mdc.link.Panel")) {
			switch (oChanges.name) {
				case "items":
					var aItems = oChanges.child ? [
						oChanges.child
					] : oChanges.children;

					aItems.forEach(function(oPanelItem) {
						switch (oChanges.mutation) {
							case "insert":
								oModel.setProperty("/countMainItems", oPanelItem.getIsMain() ? oModel.getProperty("/countMainItems") + 1 : oModel.getProperty("/countMainItems"));
								if (!oPanelItem.getIsMain()) {
									oModel.setProperty("/countNonMainItemsWithIcon", oPanelItem.getIcon() ? oModel.getProperty("/countNonMainItemsWithIcon") + 1 : oModel.getProperty("/countNonMainItemsWithIcon"));
									oModel.setProperty("/countNonMainItemsWithoutIcon", oPanelItem.getIcon() ? oModel.getProperty("/countNonMainItemsWithoutIcon") : oModel.getProperty("/countNonMainItemsWithoutIcon") + 1);
								}

								// Note: the new item(s) has been already added/inserted into the aggregation, so we have to insert the relevant model item into same position.
								var aRuntimeItems = oModel.getProperty("/runtimeItems/");
								aRuntimeItems.splice(this.indexOfItem(oPanelItem), 0, oPanelItem.getJson());
								oModel.setProperty("/runtimeItems", aRuntimeItems);

								this._propagateDefaultIcon(oModel.getProperty("/countNonMainItemsWithIcon") > 0 && oModel.getProperty("/countNonMainItemsWithoutIcon") > 0);

								// Assumption: only property 'visible' can be changed inside of the 'items' aggregation during the runtime.
								this._oObserver.observe(oPanelItem, {
									properties: [
										"visible"
									]
								});
								break;
							case "remove":
								this._oObserver.unobserve(oPanelItem);
								Log.error("Deletion of items is not supported yet");
								break;
							default:
								Log.error("Mutation '" + oChanges.mutation + "' is not supported yet.");
						}
					}, this);
					break;
				case "enablePersonalization":
					this.byId("idSectionPersonalizationButton").setVisible(oChanges.current);
					break;
				default:
					Log.error("The property or aggregation '" + oChanges.name + "' has not been registered.");
			}
		} else if (oChanges.object.isA("sap.ui.mdc.link.PanelItem")) {
			switch (oChanges.name) {
				case "visible":
					var oPanelItem = oChanges.object;
					// if (oPanelItem.getVisibleChangedByUser()) {
					// Note: the new item(s) has been already added/inserted into the aggregation, so we have to insert the relevant model item into same index.
					oModel.setProperty("/runtimeItems/" + this.indexOfItem(oPanelItem) + "/visible", oPanelItem.getVisible());
					// }
					// else {
					// oModel.setProperty("/baselineItems/" + iIndex + "/visible", oPanelItem.getVisible());
					// 	oModel.setProperty("/runtimeItems/" + iIndex + "/visible", oPanelItem.getVisible());
					// }
					break;
				default:
					Log.error("The '" + oChanges.name + "' of PanelItem is not supported yet.");
			}
		}
	}

	return Panel;

});
