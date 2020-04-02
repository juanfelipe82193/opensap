/*global QUnit */
QUnit.config.autostart = false;

//Require viz libs first since the viz lib will not be loaded auto. Previously the crosstable will fall back to info crosstable which is wrong. Now the fallback is removed.  
sap.ui.require([
	"sap/viz/libs/sap-viz"
], function() {

QUnit.module( "Normal Value");
  
  QUnit.test("a1a2m1", function(assert){
    assert.ok(true, "a1a2m1");
    var oModel = {
      data : [
        {color:"Red", product:"Car", revenue:46},
        {color:"Blue", product:"Car", revenue:40},
        {color:"Red", product:"Truck", revenue:72},
        {color:"Blue", product:"Truck", revenue:35}
      ]};
    var data = {
      dimensions : [
        {axis : 1, name : 'Color', value: "{color}"},
        {axis : 2, name : 'Product', value: "{product}"}
      ],
      measures : [{name : "Revenue", value : "{revenue}"}],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);
    
    var orignData = {
      "analysisAxis":[{
        "index":1,
        "data":[{
            "name":"Color",
            "values":["Red","Blue"]
             }]
        },{
        "index":2,
        "data":[{
            "name":"Product",
            "values":["Car","Truck"]
            }]
        }],
        "measureValuesGroup":[{
        "index":1,
        "data":[{
            "name":"Revenue",
            "values":[[46,40],[72,35]]
            }]
        }]
      };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("a1m1", function(assert){
    var oModel = {
        data : [
           {product: "Car", profit: 25},
           {product: "Truck", profit: 136},
           {product: "Motorcycle", profit: 23},
           {product: "Bicycle", profit: 116}
        ]};
    var data = {
        dimensions : [{axis : 1, name : 'Product', value: "{product}"}],
        measures : [{name : "Profit", value : "{profit}"}],
        data : {
          path : "/data"
        }
    };
    var vizData = parseDataWithModel(data, oModel);
    
    var orignData = {
        'analysisAxis': [{
          'index': 1,
          'data': [{
                  'name': 'Product',
                  'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
                }]
         }], 
        'measureValuesGroup': [{
          'index': 1,
          'data': [{
                'name': 'Profit',
                'values': [[25, 136, 23, 116]]
            }]
         }]};
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });
  
  QUnit.test("a1m1m2", function(assert){
    var oModel = {
        data : [
           {country: "France", "revenue1": 74, "revenue2": 376},
           {country: "Germany", "revenue1": 84, "revenue2": 540},
        ]};
    var data = {
        dimensions : [
          {axis : 1, name : 'COUNTRY', value: "{country}"},
        ],
        measures : [
          {group: 1, name : "REVENUE1", value : "{revenue1}"},
          {group: 2, name : "REVENUE2", value : "{revenue2}"},
        ],
        data : {
          path : "/data"
        }
    };
   var vizData = parseDataWithModel(data, oModel);
   var orignData = {
       "analysisAxis":[{
         "index":1,
         "data":[{"name":"COUNTRY","values":["France","Germany"]}]
       }],
       "measureValuesGroup":[{
         "index":1,
         "data":[{"name":"REVENUE1","values":[[74,84]]}]
         },{
         "index":2,
         "data":[{"name":"REVENUE2","values":[[376,540]]
         }]
       }]
     };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });
  
  QUnit.test("a1a1a2a2m1", function(assert){
    var oModel = {
        data : [
           {country: "France", product: "Car", year: "2006", color: "Black", revenue1: 14, revenue2: 58},
           {country: "France", product: "Truck",  year: "2006", color: "Black", revenue1: 0, revenue2: 0},
           {country: "German", product: "Car", year: "2006", color: "Black", revenue1: 13, revenue2: 102},
           {country: "German", product: "Truck",  year: "2006", color: "Black", revenue1: 0, revenue2: 0},
           
           {country: "France", product: "Car", year: "2006", color: "Blue", revenue1: 0, revenue2: 0},
           {country: "France", product: "Truck",  year: "2006", color: "Blue", revenue1: 20, revenue2: 89},
           {country: "German", product: "Car", year: "2006", color: "Blue", revenue1: 0, revenue2: 0},
           {country: "German", product: "Truck",  year: "2006", color: "Blue", revenue1: 18, revenue2: 72},
           
           {country: "France", product: "Car", year: "2006", color: "Red", revenue1: 8, revenue2: 34},
           {country: "France", product: "Truck",  year: "2006", color: "Red", revenue1: 0, revenue2: 0},
           {country: "German", product: "Car", year: "2006", color: "Red", revenue1: 9, revenue2: 101},
           {country: "German", product: "Truck",  year: "2006", color: "Red", revenue1: 0, revenue2: 0},
           
           {country: "France", product: "Car", year: "2007", color: "Black", revenue1: 13, revenue2: 90},
           {country: "France", product: "Truck",  year: "2007", color: "Black", revenue1: 0, revenue2: 0},
           {country: "German", product: "Car", year: "2007", color: "Black", revenue1: 6, revenue2: 65},
           {country: "German", product: "Truck",  year: "2007", color: "Black", revenue1: 0, revenue2: 0},
           
           {country: "France", product: "Car", year: "2007", color: "Blue", revenue1: 0, revenue2: 0},
           {country: "France", product: "Truck",  year: "2007", color: "Blue", revenue1: 11, revenue2: 35},
           {country: "German", product: "Car", year: "2007", color: "Blue", revenue1: 0, revenue2: 0},
           {country: "German", product: "Truck",  year: "2007", color: "Blue", revenue1: 23, revenue2: 98},
           
           {country: "France", product: "Car", year: "2007", color: "Red", revenue1: 8, revenue2: 70},
           {country: "France", product: "Truck",  year: "2007", color: "Red", revenue1: 0, revenue2: 0},
           {country: "German", product: "Car", year: "2007", color: "Red", revenue1: 15, revenue2: 102},
           {country: "German", product: "Truck",  year: "2007", color: "Red", revenue1: 0, revenue2: 0}           
        ]};
    var data = {
        dimensions : [
            {axis : 1, name : 'COUNTRY', value: "{country}"},
            {axis : 1, name : 'PRODUCT', value: "{product}"},
            {axis : 2, name : 'YEAR', value: "{year}"},
            {axis : 2, name : 'COLOR', value: "{color}"}
          ],
          measures : [
						{name : "REVENUE1", value : "{revenue1}"},
						{name : "REVENUE2", value : "{revenue2}"}
          ],
          data : {
            path : "/data"
          }
    };
    var vizData = parseDataWithModel(data, oModel);
    var orignData = {
        "analysisAxis":[{
          "index":1,
          "data":[{
            "name":"COUNTRY",
            "values":["France","France","German","German"]},{
            "name":"PRODUCT",
            "values":["Car","Truck","Car","Truck"]
              }]
          },{
          "index":2,
          "data":[{
            "name":"YEAR",
            "values":["2006","2006","2006","2007","2007","2007"]},{
            "name":"COLOR",
            "values":["Black","Blue","Red","Black","Blue","Red"]
              }]
        }],
        "measureValuesGroup":[{
          "index":1,
          "data":[{
            "name":"REVENUE1",
            "values":[[14,0,13,0],[0,20,0,18],[8,0,9,0],[13,0,6,0],[0,11,0,23],[8,0,15,0]]
            },{
            "name":"REVENUE2",
            "values":[[58,0,102,0],[0,89,0,72],[34,0,101,0],[90,0,65,0],[0,35,0,98],[70,0,102,0]]
            }
          ]}
        ]};
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  }); 
  
  QUnit.test("a1a2m1m2m3m4",function(assert){
	  var oModel = {
		    data : [
		      {country :"China", year :'2006', revenue1 :40, revenue2 :50, revenue3 :60, revenue4 :30},
		      {country :"USA", year :'2006', revenue1 :10, revenue2 :60, revenue3 :30, revenue4 :70},
		      {country :"Germany", year : '2006', revenue1 :80, revenue2 :60, revenue3 :10, revenue4 :15}     
    	]};
	  var data = {
	     dimensions : [
         {axis : 1, name : 'Country', value: "{country}"},  
         {axis : 2, name : 'Year', value : "{year}"}
        ],
	     measures : [
         {group: 1, name : "REVENUE1", value : "{revenue1}"},
         {group: 2, name : "REVENUE2", value : "{revenue2}"},
			   {group: 3, name : "REVENUE3", value : "{revenue3}"},
			   {group: 4, name : "REVENUE4", value : "{revenue4}"}],
       data : {
         path : "/data"
       }
	    };
	  var vizData = parseDataWithModel(data, oModel);
	  var orignData = {
	        'analysisAxis': [{
	          'index': 1,
	          'data': [{
                'name': 'Country',
                'values': ['China', 'USA', 'Germany']
              }]
	         },{
	           'index' : 2,
	           'data' : [{
	       	   		'name' : 'Year',
	       	   		'values' : ['2006']
         			}]	        	 
	         }], 
	        'measureValuesGroup': [{
	          'index': 1,
	          'data': [{
	                'name': 'REVENUE1',
	                'values': [[40,10,80]]
	            }]
         	},{
              'index': 2,
  	          'data': [{
  	                'name': 'REVENUE2',
  	                'values': [[50,60,60]]
  	            }]	
         	},{
         		'index': 3,
   	        'data': [{
              'name': 'REVENUE3',
              'values': [[60,30,10]]
   	         }]	
         	},{
         		'index': 4,
	   	        'data': [{
   	              'name': 'REVENUE4',
   	              'values': [[30,70,15]]
	   	         }]	
         	}]};
	  simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  }); 
  
  QUnit.test('m1m2 with empty dimensions',function(assert){
	  var oModel = {
		    data : [
		      {revenue1 :100, revenue2 :50, revenue3 :60},
		      {revenue1 :35, revenue2 :65, revenue3 :85},
		      {revenue1 :20, revenue2 :11, revenue3 :45},
		      {revenue1 :5, revenue2 :65, revenue3 :15},
		      {revenue1 :50, revenue2 :35, revenue3 :78},
		      {revenue1 :10, revenue2 :88, revenue3 :36}     
  		]}; 
	  var data = {
	     dimensions : [	         
	        ],
	     measures : [
	           {group: 1, name : "REVENUE1", value : "{revenue1}"},
	           {group: 2, name : "REVENUE2", value : "{revenue2}"},
	         ],
	      data : {
	        path : "/data"
	      }
	    };
	//  var errorMsg = "";
	  //try{
	    var vizData = parseDataWithModel(data, oModel);
	    var orignData = {
	        'measureValuesGroup': [{
	              'index': 1,
	              'data': [{
	                    'name': 'REVENUE1',
	                    'values': [[100,35,20,5,50,10]]
	                }]
	            },{
	                'index': 2,
	                'data': [{
	                      'name': 'REVENUE2',
	                      'values': [[50,65,11,65,35,88]]
	                  }]  
	            }]};
	    simpleDeepEquals(vizData, orignData, "Two dataset should be the same."); 
	 // }catch(err){
	 //   errorMsg = err;
	  //}
	 // var expectedErrorMsg = "REVENUE1 wrong values count in aa1. should be 1";
	  //assert.equal(errorMsg, expectedErrorMsg, "Two error message should be the same.");
  });
  
  QUnit.test('m1m2 without dimensions',function(assert){
    var oModel = {
        data : [
          {revenue1 :100, revenue2 :50, revenue3 :60},
          {revenue1 :35, revenue2 :65, revenue3 :85},
          {revenue1 :20, revenue2 :11, revenue3 :45},
          {revenue1 :5, revenue2 :65, revenue3 :15},
          {revenue1 :50, revenue2 :35, revenue3 :78},
          {revenue1 :10, revenue2 :88, revenue3 :36}     
      ]}; 
    var data = {
       measures : [
           {group: 1, name : "REVENUE1", value : "{revenue1}"},
           {group: 2, name : "REVENUE2", value : "{revenue2}"},
         ],
       data : {
         path : "/data"
       }
      };
    var vizData = parseDataWithModel(data, oModel);
    
    var orignData = {
      'measureValuesGroup': [{
            'index': 1,
            'data': [{
                  'name': 'REVENUE1',
                  'values': [[100,35,20,5,50,10]]
              }]
          },{
              'index': 2,
              'data': [{
                    'name': 'REVENUE2',
                    'values': [[50,65,11,65,35,88]]
                }]  
          }]};
      simpleDeepEquals(vizData, orignData, "Two dataset should be the same."); 
  });
  
  QUnit.test("m1m2m3m4",function(assert){
  	assert.ok(true, "m1m2m3m4");
   	var vizData=getDataset('m1m2m3m4').getVIZDataset().data();	
	  var orignData = {
	      'measureValuesGroup' : [ {
	        'index' : 1,
	        'data' : [ {
	          'name' : 'REVENUE1',
	          'values' : [ [ 1, 5, 9, 13, 17 ] ]
	        } ]
	      }, {
	        'index' : 2,
	        'data' : [ {
	          'name' : 'REVENUE2',
	          'values' : [ [ 2, 6, 10, 14, 18 ] ]
	        } ]
	      }, {
	        'index' : 3,
	        'data' : [ {
	          'name' : 'REVENUE3',
	          'values' : [ [ 3, 7, 11, 15, 19 ] ]
	        } ]
	      }, {
	        'index' : 4,
	        'data' : [ {
	          'name' : 'REVENUE4',
	          'values' : [ [ 4, 8, 12, 16, 20 ] ]
	        } ]
	      } ]
	    };
	    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
	  });
	
	  QUnit.test("a1a1a2a2m1m2m3m4", function(assert) {
	    assert.ok(true, "a1a1a2a2m1m2m3m4");
	    var vizData = getDataset('a1a1a2a2m1m2m3m4').getVIZDataset().data();
	    var orignData = {
	      "analysisAxis" : [ {
	        "index" : 1,
	        "data" : [ {
	          "name" : "COUNTRY",
	          "values" : [ "France", "France", "Germany", "Germany" ]
	        }, {
	          "name" : "PRODUCT",
	          "values" : [ "Car", "Truck", "Car", "Truck" ]
	        } ]
	      }, {
	        "index" : 2,
	        "data" : [ {
	          "name" : "YEAR",
	          "values" : [ "2006", "2006", "2007", "2007" ]
	        }, {
	          "name" : "COLOR",
	          "values" : [ "Black", "Blue", "Black", "Blue" ]
	        } ]
	      } ],
	      'measureValuesGroup' : [
	          {
	            'index' : 1,
	            'data' : [ {
	              'name' : 'REVENUE1',
	              'values' : [ [ 14, 0, 13, 0 ], [ 0, 20, 0, 18 ], [ 13, 0, 6, 0 ],
	                  [ 0, 11, 0, 23 ] ]
	            } ]
	          },
	          {
	            'index' : 2,
	            'data' : [ {
	              'name' : 'REVENUE2',
	              'values' : [ [ 58, 0, 102, 0 ], [ 0, 89, 0, 72 ],
	                  [ 90, 0, 65, 0 ], [ 70, 0, 102, 0 ] ]
	            } ]
	          },
	          {
	            'index' : 3,
	            'data' : [ {
	              'name' : 'REVENUE3',
	              'values' : [ [ 140, 0, 130, 0 ], [ 0, 200, 0, 180 ],
	                  [ 130, 0, 60, 0 ], [ 80, 0, 150, 0 ] ]
	            } ]
	          },
	          {
	            'index' : 4,
	            'data' : [ {
	              'name' : 'REVENUE4',
	              'values' : [ [ 580, 0, 1020, 0 ], [ 0, 890, 0, 720 ],
	                  [ 900, 0, 650, 0 ], [ 0, 350, 0, 980 ] ]
	            } ]
	          } ]
	    };

	    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.module("With invalid data");

  QUnit.test("with same dimension name on a1a2", function(assert) {
    assert.ok(true, "a1a2m1");
    var vizData = getDataset('a1a2m1_sameDname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COLOR",
          "values" : [ "Red", "Blue" ]
        } ]
      }, {
        "index" : 2,
        "data" : [ {
          "name" : "COLOR",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "REVENUE",
          "values" : [ [ 46, 40 ], [ 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with same dimension name on a1a1", function(assert) {
    assert.ok(true, "a1a1m1");
    var vizData = getDataset('a1a1m1_sameDname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "France", "Germany", "Germany" ]
        }, {
          "name" : "COUNTRY",
          "values" : [ "2006", "2007", "2006", "2007" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "REVENUE",
          "values" : [ [ 42, 32, 40, 44 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with same measure name on m1m2", function(assert) {
    assert.ok(true, "a1m1m2");
    var vizData = getDataset('a1m1m2_sameMname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE',
          'values' : [ [ 74, 84 ] ]
        } ]
      }, {
        'index' : 2,
        'data' : [ {
          'name' : 'REVENUE',
          'values' : [ [ 376, 540 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with same measure name on m1m1", function(assert) {
    assert.ok(true, "a1m1m1");
    var vizData = getDataset('a1m1m1_sameMname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE',
          'values' : [ [ 74, 84 ] ]
        }, {
          'name' : 'REVENUE',
          'values' : [ [ 376, 540 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.module("With invalida data");

  QUnit.test("Lack so measure value.", function(assert) {
    var oModel = {
      data : [ {
        color : "Red",
        product : "Car",
        revenue : 46
      }, {
        color : "Blue",
        product : "Car",
        revenue : 40
      }, {
        color : "Blue",
        product : "Truck",
        revenue : 35
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Color',
        value : "{color}"
      }, {
        axis : 2,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Revenue",
        value : "{revenue}"
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Color",
          "values" : [ "Red", "Blue" ]
        } ]
      }, {
        "index" : 2,
        "data" : [ {
          "name" : "Product",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40 ], [ null, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with empty dimension name on a1", function(assert) {
    assert.ok(true, "a1m1");
    var vizData = getDataset('a1m1_emptyDname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "",
          "values" : [ "China", "USA", "Germany", "Spain", "Brazil" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE',
          'values' : [ [ 46, 40, 40, 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with empty measure name on a1", function(assert) {
    assert.ok(true, "a1m1");
    var vizData = getDataset('a1m1_emptyMname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "China", "USA", "Germany", "Spain", "Brazil" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : '',
          'values' : [ [ 46, 40, 40, 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with null dimension name on a1", function(assert) {
    assert.ok(true, "a1m1");
    var vizData = getDataset('a1m1_nullDname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "",
          "values" : [ "China", "USA", "Germany", "Spain", "Brazil" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE',
          'values' : [ [ 46, 40, 40, 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("with null measure name on a1", function(assert) {
    assert.ok(true, "a1m1");
    var vizData = getDataset('a1m1_nullMname').getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "China", "USA", "Germany", "Spain", "Brazil" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : "",
          'values' : [ [ 46, 40, 40, 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("With null value on dimension value", function(assert) {
    var oModel = {
      data : [ {
        color : "Red",
        product : "Car",
        revenue : 46
      }, {
        color : "Blue",
        product : "Car",
        revenue : 40
      }, {
        color : null,
        product : "Truck",
        revenue : 20
      }, {
        color : "Blue",
        product : "Truck",
        revenue : 35
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Color',
        value : "{color}"
      }, {
        axis : 2,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Revenue",
        value : "{revenue}"
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Color",
          "values" : [ "Red", "Blue", null ]
        } ]
      }, {
        "index" : 2,
        "data" : [ {
          "name" : "Product",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40, null ], [ null, 35, 20 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("With null value on measure value", function(assert) {
    var oModel = {
      data : [ {
        product : "Car",
        profit : 25
      }, {
        product : "Truck",
        profit : 136
      }, {
        product : "Motorcycle",
        profit : null
      }, {
        product : "Bicycle",
        profit : 116
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : "{profit}"
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ 25, 136, null, 116 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("With undefined on measure value", function(assert) {
    var oModel = {
      data : [ {
        product : "Car",
        profit : 25
      }, {
        product : "Truck",
        profit : 136
      }, {
        product : "Motorcycle",
        profit : undefined
      }, {
        product : "Bicycle",
        profit : 116
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : "{profit}"
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ 25, 136, undefined, 116 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("With more than 2 axis", function(assert) {
    //ok(true, "a1m1");
    var oModel = {
      data : [ {
        product : "Car",
        profit : 25
      }, ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : "Product",
        value : "{product}"
      }, {
        axis : 2,
        name : "Product",
        value : "{product}"
      }, {
        axis : 3,
        name : "Product",
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : "{profit}"
      } ],
      data : {
        path : "/data"
      }
    };

    var errMsg = "";

    try {
      var vizData = parseDataWithModel(data, oModel);
    } catch (err) {
      errMsg = err.message;
    }

    var expectedErrorMsg = "currently, only axis 1 and 2 are supported";
    assert.equal(errMsg, expectedErrorMsg,
        "There should throw error message when number of axis exceed 2.");
  });

  QUnit.test( "With invalid measures", function(assert) {
        //ok(true, "a1m1");
        var oModel = {
          data : [ {
            country : "China",
            product : "car",
            revenue1 : 100,
            revenue2 : 50,
            revenue3 : 60
          }, {
            country : "China",
            product : "bike",
            revenue1 : 35,
            revenue2 : 65,
            revenue3 : 85
          }, {
            country : "German",
            product : "car",
            revenue1 : 20,
            revenue2 : 11,
            revenue3 : 45
          }, {
            country : "German",
            product : "bike",
            revenue1 : 5,
            revenue2 : 65,
            revenue3 : 15
          }, {
            country : "America",
            product : "car",
            revenue1 : 50,
            revenue2 : 35,
            revenue3 : 78
          }, {
            country : "America",
            product : "bike",
            revenue1 : 10,
            revenue2 : 88,
            revenue3 : 36
          } ]
        };
        var data = {
          dimensions : [],
          measures : [ {
            group : 0,
            name : "REVENUE1",
            value : "{revenue1}"
          }, {
            group : 1,
            name : "REVENUE2",
            value : "{revenue2}"
          },
          //			   {group: 3, name : "REVENUE3", value : "{revenue3}"}			  
          ],
          data : {
            path : "/data"
          }
        };

        var errMsg = undefined;

        try {
          var vizData = parseDataWithModel(data, oModel);
        } catch (err) {
          errMsg = err.message;
        }

        assert.equal( errMsg, undefined, 
            "There shouldn't throw error message when feed invalid measures when only feed index 1 and 3 for measure."
                + errMsg);
      });

  QUnit.module("attribute and function in flattenedDataset");
  QUnit.test("update dimension name", function(assert) {
    assert.ok(true, 'a1a2m1');
    var vizFlatData = getDataset('a1a2m1');
    var orignDName = vizFlatData.getDimensions()[1].getName();

    assert.equal(orignDName, 'Product', "geName() works correctly");

    var updateDname = vizFlatData.getDimensions()[1].setName("newProduct");
    var vizData = vizFlatData.getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Color",
          "values" : [ "Red", "Blue" ]
        } ]
      }, {
        "index" : 2,
        "data" : [ {
          "name" : "newProduct",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40 ], [ 72, 35 ] ]
        } ]
      } ]
    };

    simpleDeepEquals(vizData, orignData, "setName()works fine,Two dataset should be the same.");
  });

  QUnit.test("update measure name", function(assert) {
    assert.ok(true, 'a1m1m2');
    var vizFlatData = getDataset('a1m1m2');
    var orignDName = vizFlatData.getMeasures()[1].getName();

    assert.equal(orignDName, 'REVENUE2', "geName() works correctly");

    var updateDname = vizFlatData.getMeasures()[1].setName("newRevenue");
    var vizData = vizFlatData.getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE1',
          'values' : [ [ 74, 84 ] ]
        } ]
      }, {
        'index' : 2,
        'data' : [ {
          'name' : 'newRevenue',
          'values' : [ [ 376, 540 ] ]
        } ]
      } ]
    };

    simpleDeepEquals(vizData, orignData, "setName()works fine,Two dataset should be the same.");
  });

  QUnit.test("destroyDimensions", function(assert) {
    assert.ok(true, 'a1a2m1');
    var vizFlatData = getDataset('a1a2m1').destroyDimensions();
    var vizData = vizFlatData.getVIZDataset().data();
    var orignData = {
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40, 72, 35 ] ]
        } ]
      } ]
    };

    simpleDeepEquals(vizData, orignData, "destroyDimensions()works fine,Two dataset should be the same.");
  });

  QUnit.test("destroyMeasures", function(assert) {
    assert.ok(true, 'a1m1m2');
    var vizFlatData = getDataset('a1m1m2').destroyMeasures();
    var vizData = vizFlatData.getVIZDataset().data();
    var orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ]
    };

    simpleDeepEquals(vizData, orignData, "destroyMeasures()works fine,Two dataset should be the same.");
  });

  QUnit.test("removeDimension and addDimension", function(assert) {
    assert.ok(true, 'a1a2m1');
    var orignData;
    var vizData;
    var vizFlatData = getDataset("a1a2m1");
    var dimension = vizFlatData.getDimensions()[1];
    vizFlatData.removeDimension(dimension);
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Color",
          "values" : [ "Red", "Blue" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "removeDimension()works fine,Two dataset should be the same.");
    vizFlatData.addDimension(dimension);
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Color",
          "values" : [ "Red", "Blue" ]
        } ]
      }, {
        "index" : 2,
        "data" : [ {
          "name" : "Product",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40 ], [ 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "addDimension()works fine,Two dataset should be the same.");
  });

  QUnit.test("removeMeasure and addMeasure", function(assert) {
    assert.ok(true, 'a1m1m2');
    var orignData;
    var vizData;
    var vizFlatData = getDataset("a1m1m2");
    var measure = vizFlatData.getMeasures()[0];
    vizFlatData.removeMeasure(measure);
    var errMsg = "";
    try{
      vizData = vizFlatData.getVIZDataset().data();
    }catch(err){
      errMsg = err.message;
    }
    var expectedMsg = "Measure Group 1 is missing.";
    assert.equal(errMsg, expectedMsg, "One measure group is missing.");
    vizFlatData.addMeasure(measure);
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE1',
          'values' : [ [ 74, 84 ] ]
        } ]
      }, {
        'index' : 2,
        'data' : [ {
          'name' : 'REVENUE2',
          'values' : [ [ 376, 540 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "addMeasure()works fine,Two dataset should be the same.");
  });

  QUnit.test("removeAllDimensions and insertDimension", function(assert) {
    assert.ok(true, 'a1a2m1');
    var orignData;
    var vizData;
    var vizFlatData = getDataset("a1a2m1");
    var dimension = vizFlatData.getDimensions()[1];
    vizFlatData.removeAllDimensions();
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 46, 40, 72, 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "removeAllDimensions()works fine,Two dataset should be the same.");
    vizFlatData.insertDimension(dimension);
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 2,
        "data" : [ {
          "name" : "Product",
          "values" : [ "Car", "Truck" ]
        } ]
      } ],
      "measureValuesGroup" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "Revenue",
          "values" : [ [ 40 ], [ 35 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "insertDimension()works fine,Two dataset should be the same.");
  });

  QUnit.test("removeAllMeasures and insertMeasure", function(assert) {
    assert.ok(true, 'a1m1m2');
    var orignData;
    var vizData;
    var vizFlatData = getDataset("a1m1m2");
    var measure = vizFlatData.getMeasures()[0];
    vizFlatData.removeAllMeasures();
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "removeAllMeasures()works fine,Two dataset should be the same.");

    vizFlatData.insertMeasure(measure);
    vizData = vizFlatData.getVIZDataset().data();
    orignData = {
      "analysisAxis" : [ {
        "index" : 1,
        "data" : [ {
          "name" : "COUNTRY",
          "values" : [ "France", "Germany" ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'REVENUE1',
          'values' : [ [ 74, 84 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData,
        "insertMeasure()works fine,Two dataset should be the same.");

  });

  QUnit.test("indexOfDimension", function(assert) {
    assert.ok(true, 'a1a2m1');
    var vizFlatData = getDataset('a1a2m1');
    var dimension = vizFlatData.getDimensions()[1];
    var index = vizFlatData.indexOfDimension(dimension);
    assert.equal(index, 1, "the index of dimension should be 1.");

  });
  QUnit.test("indexOfMeasure", function(assert) {
    assert.ok(true, 'a1m1m2');
    var vizFlatData = getDataset('a1m1m2');
    var measure = vizFlatData.getMeasures()[0];
    var index = vizFlatData.indexOfMeasure(measure);
    assert.equal(index, 0, "the index of measure should be 0.");
  });

  QUnit.module("format function");

  QUnit.test("format:dataset value increase 2 times", function(assert) {
    assert.ok(true, "a1m1");
    var oModel = {
      data : [ {
        product : "Car",
        profit : 25
      }, {
        product : "Truck",
        profit : 136
      }, {
        product : "Motorcycle",
        profit : 22
      }, {
        product : "Bicycle",
        profit : 116
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : {
          path : 'profit',
          formatter : function($) {
            return 2 * $;
          }
        }
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ 50, 272, 44, 232 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("format:all measure value in dataset increase 2 times ", function(assert) {
    assert.ok(true, "a1m1");
    var oModel = {
      data : [ {
        product : "Car",
        profit : 25
      }, {
        product : "Truck",
        profit : 136
      }, {
        product : "Motorcycle",
        profit : 22
      }, {
        product : "Bicycle",
        profit : 116
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : {
          path : 'profit',
          formatter : function($) {
            return 2 * $;
          }
        }
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ 50, 272, 44, 232 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("format:with conditional statement ", function(assert) {
    assert.ok(true, "a1m1");
    var oModel = {
      data : [ {
        product : "Car",
        profit : -25
      }, {
        product : "Truck",
        profit : -136
      }, {
        product : "Motorcycle",
        profit : 0
      }, {
        product : "Bicycle",
        profit : 116
      } ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : {
          path : 'profit',
          formatter : function($) {
            if ($ < 0) {
              return null;
            } else if ($ == 0) {
              return 0;
            } else {
              return undefined;
            }
          }
        }
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ null, null, 0, null ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });

  QUnit.test("format:measure value with null or undefined ", function(assert) {
    assert.ok(true, "a1m1");
    var oModel = {
      data : [ {
        product : "Car",
        profit : null
      }, {
        product : "Truck",
        profit : undefined
      }, {
        product : "Motorcycle",
        profit : 0
      }, {
        product : "Bicycle",
        profit : -3
      }, {
        product : "Tricycle",
        profit : 116
      }, ]
    };
    var data = {
      dimensions : [ {
        axis : 1,
        name : 'Product',
        value : "{product}"
      } ],
      measures : [ {
        name : "Profit",
        value : {
          path : 'profit',
          formatter : function($) {
            return 0.001 * $;
          }
        }
      } ],
      data : {
        path : "/data"
      }
    };
    var vizData = parseDataWithModel(data, oModel);

    var orignData = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Product',
          'values' : [ 'Car', 'Truck', 'Motorcycle', 'Bicycle', 'Tricycle' ]
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'name' : 'Profit',
          'values' : [ [ 0, null, 0, -0.003, 0.116 ] ]
        } ]
      } ]
    };
    simpleDeepEquals(vizData, orignData, "Two dataset should be the same.");
  });
  
  QUnit.test("format:measure format string",function(assert){
    assert.ok(true,"a1m1");
    var oModel={
            data : [
                 {product: "Car", profit: null},
                 {product: "Truck", profit: undefined},
                 {product: "Motorcycle", profit: 0},
                 {product: "Bicycle", profit: -3},
                 {product: "Tricycle", profit: 116},
              ]};
    var data = {
              dimensions : [
                  {axis : 1, name : 'Product', value: "{product}"}
                ],
                measures : [{name : "Profit", 
                           value : { path : 'profit', formatter : function($) {return "this is a string"; }}   
                }],
                data : {
                  path : "/data"
                }
          };
    var vizData=parseDataWithModel(data,oModel);
    
    var expectedData={
       'analysisAxis': [{
           'index': 1,
           'data': [{
                   'name': 'Product',
                   'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle','Tricycle']
                 }]
          }], 
         'measureValuesGroup': [{
           'index': 1,
           'data': [{
                 'name': 'Profit',
                 'values': [['this is a string', 'this is a string', 'this is a string','this is a string', 'this is a string']]
             }]
          }]};
     assert.equal(JSON.stringify(vizData), JSON.stringify(expectedData), "Two dataset should be the same.");
  });
  
  

    QUnit.test("CustomDataset", function(assert) {
        var rDataset = new sap.viz.ui5.data.CustomDataset({
            data : {
                x : 9999
            }
        });
        assert.deepEqual(rDataset.getRawDataset(), {
            x : 9999
        }, "raw dataset got as what we set");
    });

    QUnit.start();
});