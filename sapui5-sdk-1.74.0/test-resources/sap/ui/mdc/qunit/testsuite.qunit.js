sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	return {
		name: "Library 'sap.ui.mdc'", /* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2
			// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4
			// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc"
				], // Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true
			// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true
			// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./{name}.qunit"
		// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"BoolFieldHelp": {
				group: "Field",
				module: "./field/BoolFieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: false
			},
			"ConditionModel": {
				group: "Condition",
				module: "./condition/ConditionModel.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},
			"ConditionType": {
				group: "Field",
				module: "./field/ConditionType.qunit"
			},
			"ConditionsType": {
				group: "Field",
				module: "./field/ConditionsType.qunit"
			},
			"DefineConditionPanel": {
				group: "Field",
				module: "./field/DefineConditionPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: true
			},
			"Field": {
				group: "Field",
				module: "./field/Field.qunit",
				sinon: true
			},
			"FieldBase": {
				group: "Field",
				module: "./field/FieldBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: true
			},
			"FieldHelp": {
				group: "Field",
				module: "./field/FieldHelp.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: false
			},
			"FieldInfoBase": {
				group: "Field",
				module: "./field/FieldInfoBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				}
			},
			"FieldInfoBase_new": {
				group: "Field",
				module: "./field/FieldInfoBase_new.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				}
			},
			"FieldInfo": {
				group: "Field",
				module: "./field/FieldInfo.qunit",
				sinon: false
			},
			"FieldInfo_new": {
				group: "Field",
				module: "./field/FieldInfo_new.qunit",
				sinon: false
			},
			"FieldValueHelp": {
				group: "Field",
				module: "./field/FieldValueHelp.qunit",
				ui5: {
					animationMode: "none"
				}
			},
			"FieldValueHelpMTableWrapper": {
				group: "Field",
				module: "./field/FieldValueHelpMTableWrapper.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: true
			},
			"FilterField": {
				group: "Field",
				module: "./field/FilterField.qunit",
				sinon: true
			},
			"ConditionConverter": {
				group: "Condition",
				module: "./condition/ConditionConverter.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},
			"FilterOperatorUtil": {
				group: "Condition",
				module: "./condition/FilterOperatorUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},
			"ListFieldHelp": {
				group: "Field",
				module: "./field/ListFieldHelp.qunit",
				sinon: false
			},
			"ValueHelpPanel": {
				group: "Field",
				module: "./field/ValueHelpPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				}
			},
			"ActionToolbar": {
				group: "ActionToolbar",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./actiontoolbar/ActionToolbar.qunit"
			},
			"FlpLinkHandler Testsuite": {
				title: "FlpLinkHandler Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/link/testsuite.flplinkhandler.qunit.html"
			},
			"Link Testsuite": {
				title: "Link Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/link_new/testsuite.link.qunit.html"
			},
			"Table": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Table.qunit"
			},
			"Column": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Column.qunit"
			},
			"CreationRow": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/CreationRow.qunit"
			},
			"TableFlex": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/TableFlex.qunit"
			},
			"Chart": {
				group: "Chart",
				module: "./chart/Chart.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"ChartFlex": {
				group: "Chart",
				module: "./chart/ChartFlex.qunit",
				loader: {
					paths: {
						"sap/ui/mdc/qunit/chart/Helper": "test-resources/sap/ui/mdc/qunit/chart/Helper"
					}
				},
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				},
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]"
				}
			},
			"P13n Testsuite": {
				group: "p13n",
				page: "test-resources/sap/ui/mdc/qunit/p13n/testsuite.p13n.qunit.html"
			},
			"FilterBar": {
				group: "FilterBar",
				module: "./filterbar/FilterBar.qunit"
			},
			"FilterBarFlex": {
				group: "FilterBar",
				module: "./filterbar/FilterBarFlex.qunit"
			},
			"DateUtil": {
				group: "Util",
				module: "./util/DateUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/util]"
				},
				sinon: false
			},
			"MemoryLeak": {
				group: "Basic",
				module: "./MemoryLeak.qunit",
				qunit: {
					// MemoryLeakCheck loads qunit-1
					version: 1,
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			"ExploredSamples": {
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				sinon: {
					version: 4
				// MockServer dependencies are overrules by loader config above
				},
				ui5: {
					libs: [
						"sap.ui.mdc", "sap.ui.documentation", "sap.ui.layout", "sap.m"
					],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit"
			}
		}
	};
});
