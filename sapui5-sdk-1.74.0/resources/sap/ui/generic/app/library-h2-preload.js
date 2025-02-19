//@ui5-bundle sap/ui/generic/app/library-h2-preload.js
/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.predefine('sap/ui/generic/app/library',['sap/ui/core/library'],function(l){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.generic.app",version:"1.74.0",dependencies:["sap.ui.core"],types:["sap.ui.generic.app.navigation.service.NavType","sap.ui.generic.app.navigation.service.ParamHandlingMode","sap.ui.generic.app.navigation.service.SuppressionBehavior"],interfaces:[],controls:[],elements:[],noLibraryCSS:true});sap.ui.generic.app.navigation.service.ParamHandlingMode={SelVarWins:"SelVarWins",URLParamWins:"URLParamWins",InsertInSelOpt:"InsertInSelOpt"};sap.ui.generic.app.navigation.service.NavType={initial:"initial",URLParams:"URLParams",xAppState:"xAppState",iAppState:"iAppState"};sap.ui.generic.app.navigation.service.SuppressionBehavior={standard:0,ignoreEmptyString:1,raiseErrorOnNull:2,raiseErrorOnUndefined:4};sap.ui.lazyRequire("sap.ui.generic.app.AppComponent","new extend getMetadata");return sap.ui.generic.app;});
sap.ui.require.preload({
	"sap/ui/generic/app/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ui.generic.app","type":"library","embeds":[],"applicationVersion":{"version":"1.74.0"},"title":"The SAPUI5 library contains classes that are mainly used in smart template applications, but can also be used in any Fiori/UI5 application that uses the OData protocol to communicate with an application server.","description":"The SAPUI5 library contains classes that are mainly used in smart template applications, but can also be used in any Fiori/UI5 application\\n                   that uses the OData protocol to communicate with an application server.","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.74","libs":{"sap.ui.core":{"minVersion":"1.74.0"},"sap.ui.comp":{"minVersion":"1.74.0","lazy":true},"sap.m":{"minVersion":"1.74.0","lazy":true}}},"library":{"i18n":"messagebundle.properties","css":false,"content":{"controls":[],"elements":[],"types":["sap.ui.generic.app.navigation.service.NavType","sap.ui.generic.app.navigation.service.ParamHandlingMode","sap.ui.generic.app.navigation.service.SuppressionBehavior"],"interfaces":[]}}}}'
},"sap/ui/generic/app/library-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"sap/ui/generic/app/AppComponent.js":["sap/suite/ui/generic/template/lib/AppComponent.js"],
"sap/ui/generic/app/ApplicationController.js":["sap/base/Log.js","sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/TransactionController.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/fragments/MessageDialog.fragment.xml":["sap/m/Bar.js","sap/m/Button.js","sap/m/Dialog.js","sap/m/MessageItem.js","sap/m/MessageView.js","sap/m/Text.js","sap/ui/core/Fragment.js"],
"sap/ui/generic/app/library.js":["sap/ui/core/library.js"],
"sap/ui/generic/app/navigation/service/NavError.js":["sap/ui/base/Object.js"],
"sap/ui/generic/app/navigation/service/NavigationHandler.js":["sap/base/Log.js","sap/base/assert.js","sap/ui/base/Object.js","sap/ui/core/UIComponent.js","sap/ui/core/routing/HashChanger.js","sap/ui/generic/app/library.js","sap/ui/generic/app/navigation/service/NavError.js","sap/ui/generic/app/navigation/service/SelectionVariant.js","sap/ui/model/resource/ResourceModel.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/navigation/service/PresentationVariant.js":["sap/base/Log.js","sap/ui/base/Object.js","sap/ui/generic/app/navigation/service/NavError.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/navigation/service/SelectionVariant.js":["sap/base/Log.js","sap/ui/base/Object.js","sap/ui/generic/app/navigation/service/NavError.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/transaction/BaseController.js":["sap/base/Log.js","sap/ui/base/EventProvider.js","sap/ui/generic/app/util/DraftUtil.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/generic/app/util/Queue.js"],
"sap/ui/generic/app/transaction/DraftContext.js":["sap/ui/base/Object.js","sap/ui/generic/app/util/ModelUtil.js"],
"sap/ui/generic/app/transaction/DraftController.js":["sap/base/Log.js","sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/DraftContext.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/transaction/TransactionController.js":["sap/ui/generic/app/transaction/BaseController.js","sap/ui/generic/app/transaction/DraftController.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/util/ActionUtil.js":["sap/base/Log.js","sap/base/strings/formatMessage.js","sap/m/Dialog.js","sap/m/MessageBox.js","sap/m/Text.js","sap/m/VBox.js","sap/ui/base/ManagedObject.js","sap/ui/comp/smartfield/SmartField.js","sap/ui/comp/smartfield/SmartLabel.js","sap/ui/generic/app/util/ModelUtil.js","sap/ui/layout/form/SimpleForm.js","sap/ui/thirdparty/jquery.js"],
"sap/ui/generic/app/util/MessageUtil.js":["sap/m/MessageToast.js","sap/ui/core/ValueState.js","sap/ui/core/syncStyleClass.js","sap/ui/model/Filter.js","sap/ui/model/FilterOperator.js","sap/ui/model/json/JSONModel.js"],
"sap/ui/generic/app/util/Queue.js":["sap/ui/thirdparty/jquery.js"]
}});
//# sourceMappingURL=library-h2-preload.js.map