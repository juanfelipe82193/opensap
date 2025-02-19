/* global document */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/fl/FakeLrepConnectorLocalStorage",
    "sap/ui/fl/FakeLrepConnectorSessionStorage",
    "sap/ui/rta/util/UrlParser",
    "./model/models",
    "./controller/ErrorHandler"
], function (
    UIComponent,
    Device,
    FakeLrepConnectorLocalStorage,
    FakeLrepConnectorSessionStorage,
    UrlParser,
    models,
    ErrorHandler
) {
    "use strict";

    return UIComponent.extend("sap.ui.demo.worklist.Component", {

        metadata : {
            manifest: "json"
        },

        constructor: function () {
            UIComponent.prototype.constructor.apply(this, arguments);
            this._createFakeLrep();
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this function, the FLP and device models are set and the router is initialized.
         * @public
         * @override
         */
        init : function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // initialize the error handler with the component
            this._oErrorHandler = new ErrorHandler(this);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // set the FLP model
            this.setModel(models.createFLPModel(), "FLP");

            // create the views based on the url/hash
            this.getRouter().initialize();
        },

        /**
         * The component is destroyed by UI5 automatically.
         * In this method, the ErrorHandler is destroyed.
         * @public
         * @override
         */
        destroy : function () {
            this._oErrorHandler.destroy();

            var mAppManifest = this.getManifestEntry("sap.app");
            this.FakeLrepConnectorStorage.disableFakeConnector(
                mAppManifest.id + '.Component',
                mAppManifest.applicationVersion.version
            );

            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass : function () {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                // eslint-disable-next-line sap-no-proprietary-browser-api
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        _createFakeLrep: function () {
            var mAppManifest = this.getManifestEntry("sap.app");

            if (UrlParser.getParam('sap-rta-lrep-storage-type') === "sessionStorage") {
                this.FakeLrepConnectorStorage = FakeLrepConnectorSessionStorage;
            } else {
                this.FakeLrepConnectorStorage = FakeLrepConnectorLocalStorage;
            }

            var mSettings = {};
            this.FakeLrepConnectorStorage.enableFakeConnector(
                mSettings,
                mAppManifest.id + '.Component',
                mAppManifest.applicationVersion.version
            );
        }
    });
});