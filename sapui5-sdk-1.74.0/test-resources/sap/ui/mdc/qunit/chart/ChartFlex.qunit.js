/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/chart/ChartSettings", "sap/ui/mdc/flexibility/Chart.flexibility", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/mdc/condition/ConditionModel", "sap/ui/mdc/p13n/Util", 'sap/base/util/merge', "sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
], function (ChartSettings, ChartFlexibility, ChangesWriteAPI, JsControlTreeModifier, UIComponent, ComponentContainer, ConditionModel, Util, merge, FlexRuntimeInfoAPI) {
	'use strict';

	var fParseSortObjectToArray = function(mValue) {
		var aValue = [];

		//in case sortConditions is empty
		if (!mValue) {
			return aValue;
		}

		Object.keys(mValue).forEach(function(sName) {
			aValue.push({
				name: sName,
				descending: mValue[sName].descending
			});
		});
		return aValue;
	};


	QUnit.module("Change handler for visibility of items", {
		beforeEach: function () {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function () {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' +
							'\t\t  xmlns:core="sap.ui.core"\n' +
							'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
							'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
							'\t\t  xmlns:state="sap.ui.mdc.base.state"\n' +
							'\t\t  xmlns="sap.m">\n' +
							'\t\t\t\t<mdc:Chart id="IDChartVisibility" delegate="{ \'name\': \'sap/ui/mdc/qunit/chart/Helper\' }">\n' +
							'\t\t\t\t\t\t<mdc:items><chart:DimensionItem id="item0" key="Name" label="Name" role="category"></chart:DimensionItem>\n' +
							'\t\t\t\t\t\t<chart:MeasureItem id="item1" key="SalesAmount" label="Depth" role="axis1"></chart:MeasureItem>\n' +
							'\t\t\t\t\t\t<chart:MeasureItem id="item2" key="SalesNumber" label="Width" role="axis2"></chart:MeasureItem></mdc:items>\n' +
							'\t\t\t\t</mdc:Chart>\n' +
							'</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChartVisibility');
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("add and remove an item on the chart", function (assert) {
		var done = assert.async(2);

		//create sample data, 'simulate' user action
		ChartSettings.aProperties = [
			{ id: 'item0', name: 'item0', label: 'Name', role: 'category' },
			{ id: 'item1', name: 'SalesAmount', label: 'Depth', role: 'axis1' },
			{ id: 'item2', name: 'SalesNumber', label: 'Width', role: 'axis2' }
		];
		ChartSettings._getP13nStateOfChart(this.oChart).then(function (oP13nData) {
			this.oInitialState = merge({}, oP13nData);
			this.oChangedState = merge({}, oP13nData);
			var fnSymbol;
			//since we set the data manually, we need to use 'name' because there is a mapping inbetween
			this.oChangedState.items.push({ id: 'item4', name: 'Country', label: 'Country', role: 'category' });
			fnSymbol = function (o) {
				return o.name + o.role;
			};
			//create according change(s)
			var aChanges = Util._processResult(this.oInitialState.items, this.oChangedState.items, fnSymbol, this.oChart, "removeItem", "addItem");
			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created:" + aChanges.length);
			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				//check if the flex data has been stored correctly
				assert.strictEqual(this.oChart.getItems().length, 4, "The correct amount of changes has been processed, chart has:" + this.oChart.getItems().length + " items");
				//check if the values of the items aggregation are correct
				assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
				assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
				assert.strictEqual(this.oChart.getItems()[0].getRole(), "category", "correct attribute: " + this.oChart.getItems()[0].getRole());
				assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
				assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
				assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());
				assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
				assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
				assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());
				assert.strictEqual(this.oChart.getItems()[3].getKey(), "Country", "correct attribute: " + this.oChart.getItems()[3].getKey());
				assert.strictEqual(this.oChart.getItems()[3].getLabel(), "Country", "correct attribute: " + this.oChart.getItems()[3].getLabel());
				assert.strictEqual(this.oChart.getItems()[3].getRole(), "category", "correct attribute: " + this.oChart.getItems()[3].getRole());
				done();
				//now remove the added item
				this.oInitialState = merge({}, this.oChangedState);
				this.oChangedState = merge({}, this.oChangedState);
				this.oChangedState.items.pop();
				//create according change(s)
				aChanges = Util._processResult(this.oInitialState.items, this.oChangedState.items, fnSymbol, this.oChart, "removeItem", "addItem");
				Util.handleUserChanges(aChanges, this.oChart).then(function () {
					//check if the change has been created correctly
					assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created:" + aChanges.length);
					//check if the flex data has been stored correctly
					assert.strictEqual(this.oChart.getItems().length, 3, "The correct amount of changes has been processed, chart has:" + this.oChart.getItems().length + " items");
					//check if the values of the items aggregation are correct
					assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
					assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
					assert.strictEqual(this.oChart.getItems()[0].getRole(), "category", "correct attribute: " + this.oChart.getItems()[0].getRole());
					assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
					assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
					assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());
					assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
					assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
					assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));

	});

	QUnit.test("change an existing role on an item", function (assert) {
		var done = assert.async(1);

		//create sample data, 'simulate' user action
		ChartSettings.aProperties = [
			{ id: 'item0', name: 'Name', label: 'Name', role: 'category', selected: true },
			{ id: 'item1', name: 'SalesAmount', label: 'Depth', role: 'axis1', selected: true },
			{ id: 'item2', name: 'SalesNumber', label: 'Width', role: 'axis2', selected: true }
		];
		ChartSettings._getP13nStateOfChart(this.oChart).then(function (oP13nData) {
			this.oInitialState = merge({}, oP13nData);
			this.oChangedState = merge({}, oP13nData);
			var fnSymbol;
			//since we set the data manually, we need to use 'name' because there is a mapping inbetween
			this.oChangedState.items[0].role = "series";

			fnSymbol = function (o) {
				return o.name + o.role;
			};

			//create according change(s)
			var aChanges = Util._processResult(this.oInitialState.items, this.oChangedState.items, fnSymbol, this.oChart, "removeItem", "addItem");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created:" + aChanges.length);

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {

				//check if the flex data has been stored correctly
				assert.strictEqual(this.oChart.getItems().length, 3);
				//check if the values of the items aggregation are correct
				assert.strictEqual(this.oChart.getItems()[0].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[0].getKey());
				assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[0].getLabel());
				assert.strictEqual(this.oChart.getItems()[0].getRole(), "series", "correct attribute: " + this.oChart.getItems()[0].getRole());

				assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[1].getKey());
				assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[1].getLabel());
				assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[1].getRole());

				assert.strictEqual(this.oChart.getItems()[2].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[2].getKey());
				assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[2].getLabel());
				assert.strictEqual(this.oChart.getItems()[2].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[2].getRole());
				done();
			}.bind(this));
		}.bind(this));
	});
	QUnit.module("Change handler for visibility of items", {
		beforeEach: function () {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function () {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' +
							'\t\t  xmlns:core="sap.ui.core"\n' +
							'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
							'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
							'\t\t  xmlns:state="sap.ui.mdc.base.state"\n' +
							'\t\t  xmlns="sap.m">\n' +
							'\t\t\t\t<mdc:Chart id="IDChartVisibility2" delegate="{ \'name\': \'sap/ui/mdc/qunit/chart/Helper\' }">\n' +
							'\t\t\t\t\t\t<mdc:items><chart:DimensionItem id="item0" key="Name" label="Name" role="category"></chart:DimensionItem>\n' +
							'\t\t\t\t\t\t<chart:MeasureItem id="item1" key="SalesAmount" label="Depth" role="axis1"></chart:MeasureItem>\n' +
							'\t\t\t\t\t\t<chart:MeasureItem id="item2" key="SalesNumber" label="Width" role="axis2"></chart:MeasureItem></mdc:items>\n' +
							'\t\t\t\t</mdc:Chart>\n' +
							'</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChartVisibility2');
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("change the position of an existing item", function (assert) {
		var done = assert.async(1);

		//create sample data, 'simulate' user action
		ChartSettings.aProperties = [
			{ id: 'item0', name: 'Name', label: 'Name', role: 'category', selected: true },
			{ id: 'item1', name: 'SalesAmount', label: 'Depth', role: 'axis1', selected: true },
			{ id: 'item2', name: 'SalesNumber', label: 'Width', role: 'axis2', selected: true }
		];
		ChartSettings._getP13nStateOfChart(this.oChart).then(function (oP13nData) {
			this.oInitialState = merge({}, oP13nData);
			this.oChangedState = {};
			this.oChangedState.items = [];
			this.oChangedState.items.push(this.oInitialState.items[1]);
			this.oChangedState.items.push(this.oInitialState.items[2]);
			this.oChangedState.items.push(this.oInitialState.items[0]);
			var fnSymbol;
			fnSymbol = function (o) {
				return o.name + o.role;
			};

			//create according change(s)
			var aChanges = Util._processResult(this.oInitialState.items, this.oChangedState.items, fnSymbol, this.oChart, "removeItem", "addItem");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created:" + aChanges.length);

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {

				//check if the flex data has been stored correctly
				assert.strictEqual(this.oChart.getItems().length, 3);
				//check if the values of the items aggregation are correct

				assert.strictEqual(this.oChart.getItems()[0].getKey(), "SalesAmount", "correct attribute: " + this.oChart.getItems()[0].getKey());
				assert.strictEqual(this.oChart.getItems()[0].getLabel(), "Depth", "correct attribute: " + this.oChart.getItems()[0].getLabel());
				assert.strictEqual(this.oChart.getItems()[0].getRole(), "axis1", "correct attribute: " + this.oChart.getItems()[0].getRole());

				assert.strictEqual(this.oChart.getItems()[1].getKey(), "SalesNumber", "correct attribute: " + this.oChart.getItems()[1].getKey());
				assert.strictEqual(this.oChart.getItems()[1].getLabel(), "Width", "correct attribute: " + this.oChart.getItems()[1].getLabel());
				assert.strictEqual(this.oChart.getItems()[1].getRole(), "axis2", "correct attribute: " + this.oChart.getItems()[1].getRole());

				assert.strictEqual(this.oChart.getItems()[2].getKey(), "Name", "correct attribute: " + this.oChart.getItems()[2].getKey());
				assert.strictEqual(this.oChart.getItems()[2].getLabel(), "Name", "correct attribute: " + this.oChart.getItems()[2].getLabel());
				assert.strictEqual(this.oChart.getItems()[2].getRole(), "category", "correct attribute: " + this.oChart.getItems()[2].getRole());
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('addItem - applyChange & revertChange on a js control tree', function (assert) {
		var sProperty = "SomePropertyName";
		var done = assert.async();
		return ChangesWriteAPI.create({
			changeSpecificData: {
				"changeType": "addItem",
				"selector": {
					"id": "comp---view--IDChartVisibility2"
				},
				"content": {
					"name": sProperty,
					"kind": "dimension",
					"role": "category",
					"label": "SomeLabel"
				}
			},
			selector: this.oChart
		}).then(function (oChange) {
			var oChangeHandler = ChartFlexibility["addItem"].changeHandler;

			assert.strictEqual(this.oChart.getItems().length, 3);

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){
				assert.strictEqual(this.oChart.getItems()[3].getId(), "comp---view--IDChartVisibility2--" + sProperty, "item has been added");
				assert.strictEqual(this.oChart.getItems().length, 4);

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				});
				assert.strictEqual(this.oChart.getItems().length, 3, "item has been removed");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('removeItem - applyChange & revertChange on a js control tree', function (assert) {
		var done = assert.async();
		return ChangesWriteAPI.create({
			changeSpecificData: {
				"changeType": "removeItem",
				"selector": {
					"id": "comp---view--IDChartVisibility2"
				},
				"content": {
					"id": "comp---view--item1"
				}
			},
			selector: this.oChart
		}).then(function (oChange) {
			var oChangeHandler = ChartFlexibility["removeItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3, "3 existing items");

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){
				assert.strictEqual(this.oChart.getItems().length, 2, "remove applied correctly: item has been removed from the aggregation");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){
					assert.strictEqual(this.oChart.getItems().length, 3, "remove reverted correctly: item has been added to the aggregation");
				});

				done();
			}.bind(this));


		}.bind(this));
	});



	QUnit.module("Change handler for sorting", {
		beforeEach: function () {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function () {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns:state="sap.ui.mdc.base.state"\n' + '\t\t  xmlns="sap.m">\n' + '\t\t\t\t<mdc:Chart id="IDChart" delegate="{ \'name\': \'sap/ui/mdc/qunit/chart/Helper\' }">\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart');
			this.oChart.setSortConditions([]);
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("add and remove sort without existing changes", function (assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function () {

			//create sample data, 'simulate' user action
			var aExistingArray = [], fnSymbol;
			var aChangedArray = [{ "name": "Name", "descending": false, "index": 0 }];

			fnSymbol = function (o) {
				return o.name + o.descending;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addSort", "The created change has a correct type");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				//check if the flex data has been stored correctly
				FlexRuntimeInfoAPI.waitForChanges({
					element: this.oChart
				}).then(function () {
					var aSorters = fParseSortObjectToArray(this.oChart.getSortConditions());

					assert.strictEqual(aSorters.length, 1, "The flex data has been stored successfully");
					assert.strictEqual(aSorters[0].name, "Name", "The flex data has been stored successfully");

					aExistingArray = Object.assign([], aSorters);
					aChangedArray = [];

					aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
					assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
					assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The created change has a correct type");
					assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");

					//apply the change
					Util.handleUserChanges(aChanges, this.oChart).then(function () {
						FlexRuntimeInfoAPI.waitForChanges({
							element: this.oChart
						}).then(function () {
							//check if the flex data has been stored correctly
							var aSorters = fParseSortObjectToArray(this.oChart.getSortConditions());

							assert.strictEqual(aSorters.length, 0, "The flex data has been stored successfully");
							done();
						}.bind(this));
					}.bind(this));
				}.bind(this));

			}.bind(this));
		}.bind(this));
	});
	QUnit.test("change existing sortOrder", function (assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function () {

			//create sample data, 'simulate' user action
			var aExistingArray = [{ "name": "Name", "index": 0, "descending": false }], fnSymbol;
			var aChangedArray = [{ "name": "Name", "index": 0, "descending": true }];

			fnSymbol = function (o) {
				return o.name + o.descending;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");

			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 2, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The first change is of type 'removeSort'");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.changeType, "addSort", "The second change is of type 'addSort'");
			assert.strictEqual(aChanges[1].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.content.descending, true, "The change includes the correct sortorder");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				//check if the flex data has been stored correctly
				FlexRuntimeInfoAPI.waitForChanges({
					element: this.oChart
				}).then(function () {
					var aSorters = fParseSortObjectToArray(this.oChart.getSortConditions());

					assert.strictEqual(aSorters.length, 1, "The flex data has been stored successfully");
					assert.strictEqual(aSorters[0].name, "Name", "The flex data has been stored successfully");
					assert.strictEqual(aSorters[0].descending, true, "The flex data has been stored successfully");
					done();
				}.bind(this));

			}.bind(this));
		}.bind(this));
	});

	QUnit.test("add and remove sort with initial sorters", function (assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function () {

			//create sample data, 'simulate' user action
			var aExistingArray = [{ "name": "Name", "index": 0 }], fnSymbol;
			var aChangedArray = [{ "name": "Name", "index": 0 }, { "name": "Product", "index": 1, "descending": true }];
			fnSymbol = function (o) {
				return o.name + o.descending;
			};
			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addSort", "The created change has a correct type");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Product", "The change includes the correct property");
			assert.strictEqual(aChanges[0].changeSpecificData.content.descending, true, "The change includes the correct sortorder");
			done();
		}.bind(this));
	});

	QUnit.module("Change handler for sorting 02", {
		beforeEach: function () {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function () {
					return sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<core:View' + '\t\t  xmlns:core="sap.ui.core"\n' + '\t\t  xmlns:mdc="sap.ui.mdc"\n' + '\t\t  xmlns="sap.m">\n' + '\t\t\t\t<mdc:Chart id="IDChart2" delegate="{ \'name\': \'sap/ui/mdc/qunit/chart/Helper\' }">\n' + '\t\t\t\t</mdc:Chart>\n' + '</core:View>'
					});
				}
			});
			this.oUiComponent = new TestComponent("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oChart = this.oView.byId('IDChart2');
			this.oChart.setSortConditions([]);
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
		}
	});

	QUnit.test("change the position of two existing sorters", function (assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function () {

			//create sample data, 'simulate' user action
			var aExistingArray = [{ name: "Category", descending: false }, { name: "ProductID", descending: false }], fnSymbol;
			var aChangedArray = [{ name: "ProductID", descending: false }, { name: "Category", descending: false }];

			this.oChart.setSortConditions({
				"Category": {descending: false},
				"ProductID": {descending: false}
			});

			fnSymbol = function (o) {
				return o.name + o.descending;
			};

			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort", "moveSort");

			//check if the change(s) have been created correctly
			assert.strictEqual(aChanges.length, 1, "The correct amount of changes has been created");
			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "moveSort", "The first change is of type 'removeSort'");

			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				FlexRuntimeInfoAPI.waitForChanges({
					element: this.oChart
				}).then(function () {

					var aSorters = fParseSortObjectToArray(this.oChart.getSortConditions());

					assert.strictEqual(aSorters.length, 2, "correct amount of sorters");
					assert.strictEqual(aSorters[0].descending, false, "correct sort order");
					assert.strictEqual(aSorters[0].name, "ProductID", "correct sorter");
					assert.strictEqual(aSorters[1].descending, false, "correct sort order");
					assert.strictEqual(aSorters[1].name, "Category", "correct sorter");
					done();
				}.bind(this));

			}.bind(this));

		}.bind(this));
	});
	QUnit.test("create multiple changes", function (assert) {
		var done = assert.async();
		this.oChart.oChartPromise.then(function () {

			//create sample data, 'simulate' user action
			var aExistingArray = [
				{ name: "Category", descending: true },
				{ name: "Price", descending: false },
				{ name: "ProductID", descending: true }
			];
			var fnSymbol;

			var aChangedArray = [
				{ name: "Category", descending: true },
				{ name: "Price", descending: false },
				{ name: "ProductID", descending: false },
				{ name: "Depth", descending: true },
				{ name: "Name", descending: false }
			];

			fnSymbol = function (o) {
				return o.name + o.descending;
			};
			//create according change(s)
			var aChanges = Util._processResult(aExistingArray, aChangedArray, fnSymbol, this.oChart, "removeSort", "addSort");
			//check if the change has been created correctly
			assert.strictEqual(aChanges.length, 4, "The correct amount of changes has been created");

			assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "The first change is of type 'removeSort'");
			assert.strictEqual(aChanges[0].changeSpecificData.content.name, "ProductID", "The change includes the correct property");
			assert.strictEqual(aChanges[0].changeSpecificData.content.descending, true, "The change includes the correct property");

			assert.strictEqual(aChanges[1].changeSpecificData.changeType, "addSort", "The second change is of type 'addSort'");
			assert.strictEqual(aChanges[1].changeSpecificData.content.name, "ProductID", "The change includes the correct property");
			assert.strictEqual(aChanges[1].changeSpecificData.content.descending, false, "The change includes the correct property");

			assert.strictEqual(aChanges[2].changeSpecificData.changeType, "addSort", "The third change is of type 'addSort'");
			assert.strictEqual(aChanges[2].changeSpecificData.content.name, "Depth", "The change includes the correct property");
			assert.strictEqual(aChanges[2].changeSpecificData.content.descending, true, "The change includes the correct property");

			assert.strictEqual(aChanges[3].changeSpecificData.changeType, "addSort", "The fourth change is of type 'addSort'");
			assert.strictEqual(aChanges[3].changeSpecificData.content.name, "Name", "The change includes the correct property");
			assert.strictEqual(aChanges[3].changeSpecificData.content.descending, false, "The change includes the correct property");
			//apply the change
			Util.handleUserChanges(aChanges, this.oChart).then(function () {
				FlexRuntimeInfoAPI.waitForChanges({
					element: this.oChart
				}).then(function () {
					assert.strictEqual(fParseSortObjectToArray(this.oChart.getSortConditions()).length, 3, "Correct amount of sorters");
					done();
				}.bind(this));

			}.bind(this));
		}.bind(this));
	});
});
