sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/microchart/ComparisonMicroChart",
	"sap/suite/ui/microchart/ComparisonMicroChartData"
], function (Controller, JSONModel, ComparisonMicroChart, ComparisonMicroChartData) {
	var oPageController = Controller.extend("sap.suite.ui.commons.sample.NetworkGraph.NetworkGraph", {
		onInit: function () {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.suite.ui.commons.sample.NetworkGraph", "/graph.json"));
			var that = this;

			this.getView().setModel(oModel);

			this._oModelSettings = new JSONModel({
				source: "atomicCircle",
				orientation: "LeftRight",
				arrowPosition: "End",
				arrowOrientation: "ParentOf",
				nodeSpacing: 55,
				mergeEdges: false
			});

			this.getView().setModel(this._oModelSettings, "settings");

			var fnSetContent = function (oNode) {
				oNode.setContent(new ComparisonMicroChart({
					size: "M",
					scale: "M",
					data: [
						new ComparisonMicroChartData({
							title: "USA",
							value: Math.floor(Math.random() * 60),
							color: "Neutral"
						}),
						new ComparisonMicroChartData({
							title: "EMEA",
							value: Math.floor(Math.random() * 60),
							color: "Error"
						}),
						new ComparisonMicroChartData({
							title: "APAC",
							value: -20,
							color: "Good"
						}),
						new ComparisonMicroChartData({
							title: "LTA",
							value: Math.floor(Math.random() * 60) * -1,
							color: "Critical"
						}),
						new ComparisonMicroChartData({
							title: "ALPS",
							value: Math.floor(Math.random() * 20),
							color: "Good"
						})
					]
				}).addStyleClass("sapUiSmallMargin"));

			};

			oModel.attachRequestCompleted(function (oData) {
				that.byId("graph").getNodes().forEach(function (oNode) {
					if (oNode.getKey() === "21" || oNode.getKey() === "18") {
						fnSetContent(oNode);
					}
				});
			});
		},
		onAfterRendering: function () {
			this.byId("graphWrapper").$().css("overflow-y", "auto");
		},
		mergeChanged: function (oEvent) {
			this._oModelSettings.setProperty("/mergeEdges", !!Number(oEvent.getSource().getProperty("selectedKey")));
		},
		spacingChanged: function (oEvent) {
			this._oModelSettings.setProperty("/nodeSpacing", Number(oEvent.getSource().getProperty("selectedKey")));
		}
	});
	return oPageController;
});
