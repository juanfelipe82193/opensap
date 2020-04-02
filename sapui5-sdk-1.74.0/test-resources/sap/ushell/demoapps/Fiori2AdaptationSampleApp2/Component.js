sap.ui.define([
   "sap/ui/core/UIComponent"
], function (UIComponent) {
   "use strict";
   return UIComponent.extend("sap.ui.demo.wt.Component", {
       metadata : {
           manifest: "json"
       },

      init : function () {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);
         this.getRouter().initialize();
    }
   });
});