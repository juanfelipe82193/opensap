// define a root UIComponent which exposes the main view
/*global sap, jQuery, JSONModel, setTimeout*/

(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.demo.PluginAddButtonToActionSheet.Component");
    jQuery.sap.require("sap.ui.core.UIComponent");
    jQuery.sap.require("sap.ushell.demo.PluginAddButtonToActionSheet");

    sap.ui.core.UIComponent.extend("sap.ushell.demo.PluginAddButtonToActionSheet.Component", {

        // use inline declaration instead of component.json to save 1 round trip
        metadata : {
            "manifest": "json"
        },

        createContent : function () {
        }
        /**
         * Initialization phase of component
         *
         * @private
         */
//        init : function () {
//            debugger;
//        }

    });
}());
