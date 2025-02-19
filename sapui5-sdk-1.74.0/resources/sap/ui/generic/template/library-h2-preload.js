//@ui5-bundle sap/ui/generic/template/library-h2-preload.js
/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.predefine('sap/ui/generic/template/library',['sap/ui/core/library','sap/ui/comp/library','sap/ui/generic/app/library'],function(){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.generic.template",version:"1.74.0",dependencies:["sap.ui.core","sap.ui.comp","sap.ui.generic.app"],types:[],interfaces:[],controls:[],elements:[],noLibraryCSS:true});return sap.ui.generic.template;},true);
sap.ui.require.preload({
	"sap/ui/generic/template/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ui.generic.template","type":"library","embeds":[],"applicationVersion":{"version":"1.74.0"},"title":"SAPUI5 library with artifacts for smart templates.","description":"SAPUI5 library with artifacts for smart templates.","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.74","libs":{"sap.ui.core":{"minVersion":"1.74.0"},"sap.ui.comp":{"minVersion":"1.74.0"}}},"library":{"i18n":false,"css":false,"content":{"controls":[],"elements":[],"types":[],"interfaces":[]}}}}'
},"sap/ui/generic/template/library-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"sap/ui/generic/template/library.js":["sap/ui/comp/library.js","sap/ui/core/library.js","sap/ui/generic/app/library.js"]
}});
//# sourceMappingURL=library-h2-preload.js.map