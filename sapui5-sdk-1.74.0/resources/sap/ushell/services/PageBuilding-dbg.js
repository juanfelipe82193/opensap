// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's page building service.
 *
 * @version 1.74.0
 */
sap.ui.define([
    "sap/ui2/srvc/factory",
    "sap/ui2/srvc/page",
    "sap/ui/thirdparty/jquery"
], function (factory, page, jQuery) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("PageBuilding")</code>.
     * Constructs a new instance of the page building service.
     *
     * @param {object} oAdapter
     *     the page building adapter for the logon system
     *
     * @class The Unified Shell's page building service.
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     * @since 1.15.0
     * @private
     */
    function PageBuilding (oAdapter, oContainerInterface) {

        /**
         * Returns the UI2 page building factory.
         * @returns {sap.ui2.srvc.Factory}
         *     the page building factory
         */
        this.getFactory = function () {
            return oAdapter.getFactory();
        };

        /**
         * Returns a stub for the page with the given ID.
         *
         * @param {string} sPageId
         *     the page ID
         *
         * @returns {sap.ui2.srvc.Page}
         *     the page, as a stub
         * @since 1.15.0
         */
        this.getPage = function (sPageId) {
            return oAdapter.getFactory().createPage(sPageId);
        };

        /**
         * Returns a page set.
         *
         * @param {string} sId
         *   the page set ID
         * @returns {object}
         *   a jQuery promise. Its success handler gets a sap.ui2.srvc.PageSet.
         * @since 1.15.0
         */
        this.getPageSet = function (sId) {
            var oDeferred = new jQuery.Deferred();
            oAdapter.getFactory().createPageSet(sId, oDeferred.resolve.bind(oDeferred),
                oDeferred.reject.bind(oDeferred));
            return oDeferred.promise();
        };
    }

    PageBuilding.hasNoAdapter = false;
    return PageBuilding;
}, true /* bExport */);
