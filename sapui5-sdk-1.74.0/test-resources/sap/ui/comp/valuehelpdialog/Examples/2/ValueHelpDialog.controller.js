sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/Device',
	'sap/ui/comp/valuehelpdialog/ValueHelpDialog',
	'sap/ui/model/json/JSONModel',
	'sap/ui/comp/filterbar/FilterBar',
	'sap/ui/comp/filterbar/FilterGroupItem',
	'sap/m/Token',
	'sap/m/MessageToast',
	'sap/m/Label',
	'sap/m/Input',
	'sap/m/SearchField',
	'sap/m/ColumnListItem'
], function (
		Controller,
		Device,
		ValueHelpDialog,
		JSONModel,
		FilterBar,
		FilterGroupItem,
		Token,
		MessageToast,
		Label,
		Input,
		SearchField,
		ColumnListItem
		) {
	"use strict";


	return Controller.extend("sap.ui.comp.sample.valuehelpdialog.example.2.ValueHelpDialog", {
		onInit: function () {
			this.theTokenInput = this.getView().byId("multiInput");
			this.theTokenInput.setEnableMultiLineMode(Device.system.phone);

			this.aKeys = ["CompanyCode", "CompanyName"];

			var token1 = new Token({ key: "0001", text: "SAP A.G. (0001)" });
			this.aTokens = [token1];

			this.theTokenInput.setTokens(this.aTokens);

			this.aItems = [{ CompanyCode: "0001", CompanyName: "SAP A.G.", City: "Walldorf", CurrencyCode: "EUR" },
			{ CompanyCode: "0002", CompanyName: "SAP Labs India", City: "Bangalore", CurrencyCode: "INR" },
			{ CompanyCode: "0003", CompanyName: "SAP China LAB", City: "Beijing", CurrencyCode: "CNY" },
			{ CompanyCode: "0100", CompanyName: "SAP1", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0101", CompanyName: "SAP2", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0102", CompanyName: "SAP3", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0103", CompanyName: "SAP4", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0104", CompanyName: "SAP5", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0105", CompanyName: "SAP6", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0106", CompanyName: "SAP7", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0107", CompanyName: "SAP8", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0108", CompanyName: "SAP9", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0109", CompanyName: "SAP10", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0110", CompanyName: "SAP11", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0111", CompanyName: "SAP12", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0112", CompanyName: "SAP13", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0113", CompanyName: "SAP14", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0114", CompanyName: "SAP15", City: "Berlin", CurrencyCode: "EUR" },
			{ CompanyCode: "0115", CompanyName: "SAP16", City: "Berlin", CurrencyCode: "EUR" }
			];

		},

		onValueHelpRequest: function () {
			var that = this;

			var oValueHelpDialog = new ValueHelpDialog({
				basicSearchText: this.theTokenInput.getValue(),
				title: "Company",
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				key: this.aKeys[0],
				descriptionKey: this.aKeys[1],
				stretch: Device.system.phone,

				ok: function (oControlEvent) {
					that.aTokens = oControlEvent.getParameter("tokens");
					that.theTokenInput.setTokens(that.aTokens);

					oValueHelpDialog.close();
				},

				cancel: function (oControlEvent) {
					MessageToast.show("Cancel pressed!");
					oValueHelpDialog.close();
				},

				afterClose: function () {
					oValueHelpDialog.destroy();
				}
			});


			var oColModel = new JSONModel();
			oColModel.setData({
				cols: [
					{ label: "Company Code", template: "CompanyCode" },
					{ label: "Company Name", template: "CompanyName" },
					{ label: "City", template: "City", demandPopin: true },
					{ label: "Currency Code", template: "CurrencyCode", demandPopin: true }
				]
			});
			oValueHelpDialog.getTable().setModel(oColModel, "columns");


			var oRowsModel = new JSONModel();
			oRowsModel.setData(this.aItems);
			oValueHelpDialog.getTable().setModel(oRowsModel);
			if (oValueHelpDialog.getTable().bindRows) {
				oValueHelpDialog.getTable().bindRows("/");
			}
			if (oValueHelpDialog.getTable().bindItems) {
				var oTable = oValueHelpDialog.getTable();

				oTable.bindAggregation("items", "/", function (sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;

					return new ColumnListItem({
						cells: aCols.map(function (column) {
							var colname = column.template;
							return new Label({ text: "{" + colname + "}" });
						})
					});
				});
			}

			oValueHelpDialog.setTokens(this.theTokenInput.getTokens());

			var oFilterBar = new FilterBar({
				advancedMode: true,
				filterBarExpanded: false,
				showGoOnFB: !Device.system.phone,
				filterGroupItems: [new FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "Company Code", control: new Input() }),
				new FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "Company Name", control: new Input() }),
				new FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n3", label: "City", control: new Input() }),
				new FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n4", label: "Currency Code", control: new Input() })
				],
				search: function () {
					MessageToast.show("Search pressed '" + arguments[0].mParameters.selectionSet[0].getValue() + "''");
				}
			});

			if (oFilterBar.setBasicSearch) {
				oFilterBar.setBasicSearch(new SearchField({
					showSearchButton: Device.system.phone,
					placeholder: "Search",
					search: function (event) {
						oValueHelpDialog.getFilterBar().search();
					}
				}));
			}

			oValueHelpDialog.setFilterBar(oFilterBar);

			if (this.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			} else {
				oValueHelpDialog.addStyleClass("sapUiSizeCozy");
			}

			oValueHelpDialog.open();
			oValueHelpDialog.update();
		}
	});

});