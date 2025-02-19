/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_AggregationHelper"
], function (Log, _AggregationHelper) {
	/*global QUnit*/
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[{
		oAggregation : {},
		sApply : ""
	}, {
		oAggregation : {
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty))"
	}, {
		oAggregation : {
			group : { // Note: intentionally not sorted
				TransactionCurrency : {},
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty,TransactionCurrency))"
	}, {
		oAggregation : {
			// group is optional
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {}
			},
			// group is optional
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount : {
					"with" : "average" // Note: allowed, as long as no totals are requested
				},
				NetAmountAggregate : {
					name : "NetAmount"
				},
				GrossAmountSum : {
					name : "GrossAmount",
					"with" : "countdistinct" // Note: allowed, as long as no totals are requested
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty),aggregate(Amount with average as Amount"
			+ ",GrossAmount with countdistinct as GrossAmountSum,NetAmount as NetAmountAggregate))"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmountInTransactionCurrency : {},
				NetAmountInTransactionCurrency : {}
			},
			group : {
				BillToParty : {},
				TextProperty : {},
				TransactionCurrency : {}
			}
		},
		sApply : "groupby((BillToParty,TextProperty,TransactionCurrency)"
			+ ",aggregate(GrossAmountInTransactionCurrency,NetAmountInTransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmountInTransactionCurrency : {subtotals : true}
			},
			group : {
				BillToParty : {}
				// TransactionCurrency : {} - optional
			},
			// some use case where unit appears as "standalone" dimension
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency,BillToParty)"
			+ ",aggregate(GrossAmountInTransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case,
			$top : Infinity // special case
		},
		sApply : "groupby((Region),aggregate(SalesNumber))/concat(aggregate(SalesNumber),identity)",
		sFollowUpApply // Note: follow-up request not needed in this case
			: "groupby((Region),aggregate(SalesNumber))/concat(aggregate(SalesNumber),identity)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 0, // special case
			$top : 42
		},
		sApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate(SalesNumber,$count as UI5__count),top(41))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate(SalesNumber),top(41))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			},
			groupLevels : []
		},
		mQueryOptions : {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 42,
			$top : 99
		},
		sApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),skip(41)/top(99))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/skip(41)/top(99)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumberSum : {grandTotal : true, name : "SalesNumber", "with" : "sum"}
			},
			group : {
				Region : {}
			}
		},
		sApply : "groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum))"
			+ "/concat(aggregate(SalesNumberSum with sum as UI5grand__SalesNumberSum)"
			+ ",identity)"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case
			$top : Infinity // special case
		},
		// Note: sap.chart.Chart would never do this, min/max is needed for paging only
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/concat(aggregate(Amount with max as UI5max__Amount),identity)",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true, min : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$count : true,
			$filter : "Amount ge 100",
			$orderby : "BillToParty desc",
			$skip : 0, // special case
			$top : 42
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)"
			+ "/concat(aggregate(Amount with min as UI5min__Amount"
			+ ",Amount with max as UI5max__Amount,$count as UI5__count),top(42))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)/top(42)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"},
			"UI5min__Amount" : {measure : "Amount", method : "min"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true, min : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$count : true,
			$filter : "Amount ge 100",
			$orderby : "BillToParty desc",
			$skip : 42,
			$top : 99
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)"
			+ "/concat(aggregate(Amount with min as UI5min__Amount"
			+ ",Amount with max as UI5max__Amount,$count as UI5__count),skip(42)/top(99))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)/skip(42)/top(99)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"},
			"UI5min__Amount" : {measure : "Amount", method : "min"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case
			$top : 0 // not really a special case
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/concat(aggregate(Amount with max as UI5max__Amount),top(0))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))/top(0)", // Note: not useful
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount2 : {
					max : true,
					min : true
				},
				Amount1Avg : {
					min : true,
					name : "Amount1",
					"with" : "average"
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty)"
			+ ",aggregate(Amount1 with average as Amount1Avg,Amount2))"
			+ "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg,"
			+ "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5min__Amount1Avg" : {measure : "Amount1Avg", method : "min"},
			"UI5min__Amount2" : {measure : "Amount2", method : "min"},
			"UI5max__Amount2" : {measure : "Amount2", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount1Avg : {
					min : true,
					name : "Amount1",
					"with" : "average"
				},
				Amount2 : {
					max : true,
					min : true
				}
			}
		},
		sApply : "aggregate(Amount1 with average as Amount1Avg,Amount2)"
			+ "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg,"
			+ "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5min__Amount1Avg" : {measure : "Amount1Avg", method : "min"},
			"UI5min__Amount2" : {measure : "Amount2", method : "min"},
			"UI5max__Amount2" : {measure : "Amount2", method : "max"}
		}
	}].forEach(function (oFixture) {
		QUnit.test("buildApply with " + oFixture.sApply, function (assert) {
			var mAlias2MeasureAndMethod = {},
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions),
				mResult;

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions,
				mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : oFixture.sApply}, "sApply");
			if (oFixture.mExpectedAlias2MeasureAndMethod) {
				assert.deepEqual(mAlias2MeasureAndMethod, oFixture.mExpectedAlias2MeasureAndMethod,
					"mAlias2MeasureAndMethod");
			}

			if (oFixture.sFollowUpApply) {
				mAlias2MeasureAndMethod = {};

				// code under test
				mResult = _AggregationHelper.buildApply(oFixture.oAggregation,
					oFixture.mQueryOptions, mAlias2MeasureAndMethod, true);

				assert.deepEqual(mResult, {$apply : oFixture.sFollowUpApply}, "sFollowUpApply");
				assert.deepEqual(mAlias2MeasureAndMethod, {}, "mAlias2MeasureAndMethod");
			}

			assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON,
				"original mQueryOptions unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("buildApply: optional mAlias2MeasureAndMethod", function (assert) {
		// mAlias2MeasureAndMethod is optional in _AggregationHelper.buildApply
		assert.deepEqual(_AggregationHelper.buildApply({
				aggregate : {
					Amount : {max : true}
				},
				group : {
					BillToParty : {}
				}
			}),
			{$apply : "groupby((BillToParty),aggregate(Amount))"
				+ "/concat(aggregate(Amount with max as UI5max__Amount),identity)"});
	});

	//*********************************************************************************************
	[{
		oAggregation : {
			aggregate : {},
			group : {A : {}, B : {}},
			groupLevels : ["A", "B"]
		},
		sError : "More than one group level: A,B"
	}, {
		oAggregation : {
			aggregate : {},
			group : {A : {foo : "bar"}}
		},
		sError : "Unsupported 'foo' at property: A"
	}, {
		oAggregation : {
			aggregate : {A : {foo : "bar"}},
			group : {}
		},
		sError : "Unsupported 'foo' at property: A"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : "true"}},
			group : {}
		},
		sError : "Not a boolean value for 'subtotals' at property: A"
	}, {
		oAggregation : {
			aggregate : {},
			foo : {},
			group : {}
		},
		sError : "Unsupported 'foo'"
	}, {
		oAggregation : {
			aggregate : {},
			group : []
		},
		sError : "Not a object value for 'group'"
	}, {
		oAggregation : {
			aggregate : {},
			group : {},
			groupLevels : {}
		},
		sError : "Not a array value for 'groupLevels'"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true}},
			groupLevels : ["B"]
		},
		sError : "Cannot combine visual grouping with grand total"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, "with" : "average"}}
		},
		sError : "Cannot aggregate totals with 'average'"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, "with" : "countdistinct"}}
		},
		sError : "Cannot aggregate totals with 'countdistinct'"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : true, "with" : "average"}}
		},
		sError : "Cannot aggregate totals with 'average'"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : true, "with" : "countdistinct"}}
		},
		sError : "Cannot aggregate totals with 'countdistinct'"
	}].forEach(function (oFixture, i) {
		QUnit.test("buildApply: " + oFixture.sError, function (assert) {
			assert.throws(function () {
				// code under test
				_AggregationHelper.buildApply(oFixture.oAggregation);
			}, new Error(oFixture.sError));
		});
	});

	//*********************************************************************************************
	QUnit.test("hasGrandTotal", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal(), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({A : {}}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({B : {grandTotal : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({A : {}, B : {grandTotal : true}}),
			true);
	});

	//*********************************************************************************************
	QUnit.test("hasMinOrMax", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax(), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({A : {}}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({B : {min : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({B : {max : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({A : {}, B : {max : true}}), true);
	});
});