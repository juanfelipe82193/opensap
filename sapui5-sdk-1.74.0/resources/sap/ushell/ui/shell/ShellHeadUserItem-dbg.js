/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
// Provides control sap.ushell.ui.shell.ShellHeadUserItem.
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/IconPool",
    "sap/base/security/encodeXML",
    "sap/ushell/library"
], function (Element, IconPool, encodeXML) {
        "use strict";

        /**
         * Constructor for a new ShellHeadUserItem.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         *
         * @class
         * User Header Action Item of the Shell.
         * @extends sap.ui.core.Element
         *
         * @author SAP SE
         * @version 1.74.0
         *
         * @constructor
         * @private
         * @since 1.22.0
         * @alias sap.ushell.ui.shell.ShellHeadUserItem
         * @deprecated sap.ushell.ui.shell.ShellHeadUserItem is not used in Fiori 2 design
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var ShellHeadUserItem = Element.extend("sap.ushell.ui.shell.ShellHeadUserItem", /** @lends sap.ushell.ui.shell.ShellHeadUserItem.prototype */ { metadata: {

            properties: {

                /**
                 * The name of the user.
                 */
                username: {type: "string", group: "Appearance", defaultValue: ""},

                ariaLabel: {type: "string", group: "Appearance", defaultValue: null},

                /**
                 * An image of the user, normally an URI to a image but also an icon from the sap.ui.core.IconPool is possible.
                 */
                image: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null}
            },
            events: {

                /**
                 * Event is fired when the user presses the button.
                 */
                press: {}
            }
        }});

        IconPool.getIconInfo("", ""); //Ensure Icon Font is loaded

        ShellHeadUserItem.prototype.onclick = function (oEvent) {
            this.firePress();
            // IE always interprets a click on an anker as navigation and thus triggers the
            // beforeunload-event on the window. Since a ShellHeadItem never has a valid href-attribute,
            // the default behavior should never be triggered
            oEvent.preventDefault();
        };

        ShellHeadUserItem.prototype.onsapspace = ShellHeadUserItem.prototype.onclick;

        ShellHeadUserItem.prototype.setImage = function (sImage) {
            this.setProperty("image", sImage, true);
            if (this.getDomRef()) {
                this._refreshImage();
            }
            return this;
        };

        ShellHeadUserItem.prototype.setAriaLabel = function (sAriaLabel) {
            this.setProperty("ariaLabel", sAriaLabel);
            return this;
        };

        ShellHeadUserItem.prototype._refreshImage = function () {
            var $Ico = this.$("img");
            var sImage = this.getImage();
            if (!sImage) {
                $Ico.html("").css("style", "").css("display", "none");
            } else if (IconPool.isIconURI(sImage)) {
                var oIconInfo = IconPool.getIconInfo(sImage);
                $Ico.html("").css("style", "");
                if (oIconInfo) {
                    $Ico.text(oIconInfo.content).css("font-family", "'" + oIconInfo.fontFamily + "'");
                }
            } else {
                var $Image = this.$("img-inner");
                if ($Image.length === 0 || $Image.attr("src") !== sImage) {
                    $Ico.css("style", "").html("<img id='" + this.getId() + "-img-inner' src='" + encodeXML(sImage) + "'></img>");
                }
            }
        };

        ShellHeadUserItem.prototype._checkAndAdaptWidth = function (bShellSearchVisible) {
            if (!this.getDomRef()) {
                return false;
            }

            var $Ref = this.$(),
                $NameRef = this.$("name");
            var iBeforeWidth = $Ref.width();
            $Ref.toggleClass("sapUshellShellHeadActionLimit", false);
            //User name cannot be larger than 240px
            //(if a search field is shown in the shell this max size decreases depending on the screen width)
            var iMax = 240;
            if (bShellSearchVisible) {
                iMax = Math.min(iMax, 0.5 * document.documentElement.clientWidth - 225);
            }
            if (iMax < $NameRef.width()) {
                $Ref.toggleClass("sapUshellShellHeadActionLimit", true);
            }
            return iBeforeWidth !== $Ref.width();
        };

        return ShellHeadUserItem;

    }, true /* bExport */);
