sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ovp/cards/CommonUtils"],
    function(jQuery, CommonUtils) {
		"use strict";

        var LayoutModel = function (uiModel, iColCount, iRowHeightPx, iCardBorderPx) {
            this.uiModel = uiModel;
            this.setColCount(iColCount);
            this.aCards = [];
            this.oLayoutVars = null;
            this.iDisplaceRow = null;
            this.iDummyRow = 999;
            this.iRowHeightPx = iRowHeightPx;
            this.iCardBorderPx = iCardBorderPx;
        };

		/**
		 * set number of columns
		 *
		 * @method setColCount
		 * @param {Int} iColCount - number of columns
		 */
		LayoutModel.prototype.setColCount = function(iColCount) {
			if (!iColCount) {
				this.iColCount = 5; //default
			} else if (iColCount !== this.iColCount) {
				this.iColCount = iColCount;
			}
		};

		/**
		 * set layout variants
		 * (add and overwriting existing ones)
		 *
		 * @method setLayoutVars
		 * @param {Object} oLayoutVars - object containing layout variants
		 */
        LayoutModel.prototype.setLayoutVars = function (oLayoutVars) {
            //Check for the empty LREP content
            if (Array.isArray(oLayoutVars) && oLayoutVars.length > 0) {
                this.oLayoutVars = oLayoutVars;
            }
            //build layout based on new variant
            this._buildGrid();
        };

		/**
		 * update visibility of given cards
		 * (usually called from manage cards dialog)
		 *
		 * @method updateCardVisibility
		 * @param {Array} aChgCards - array containing card ids and visibility state
		 */
        LayoutModel.prototype.updateCardVisibility = function (aChgCards) {
            var oCardVariant, oCardLayoutVariant;
            function fnFilterItem (item) {
                return item.id === aChgCards[i].id;
            }

            for (var i = 0; i < aChgCards.length; i++) {
                oCardVariant = this.oLayoutVars.filter(fnFilterItem);
                oCardLayoutVariant = this.aCards.filter(fnFilterItem);
                //If the card visibility property is changed then move the card at the end
                if (!aChgCards[i].visibility) {
                    oCardVariant[0].dashboardLayout['C' + this.iColCount].row = this._findHighestOccupiedRow();
                    oCardLayoutVariant[0].dashboardLayout.row = oCardVariant[0].dashboardLayout['C' + this.iColCount].row;
                }
                oCardVariant[0].visibility = aChgCards[i].visibility;
                oCardLayoutVariant[0].dashboardLayout.visible = aChgCards[i].visibility;
            }
        };

		/**
		 * return number of columns
		 *
		 * @method getColCount
		 * @returns {Int} iColCount - number of columns
		 */
		LayoutModel.prototype.getColCount = function() {
			return this.iColCount;
		};

		/**
		 * get cards in current layout
		 *
		 * @method getCards
		 * @param {Int} iColCount (optional)- number of columns
		 * @returns {Array} array containing cards in layout
		 */
		LayoutModel.prototype.getCards = function(iColCount) {
			//build grid if cards array was not filled before or the number of columns has changed
			if (this.aCards.length === 0 || iColCount && iColCount !== this.iColCount) {
				if (iColCount) {
					this.setColCount(iColCount);
				}
				//build grid for this.iColCount columns
				this._buildGrid();
			}
			return this.aCards;
		};

		/**
		 * Return the card by id
		 *
		 * @method getCardById
		 * @param {String} cardId - cardId
		 * @returns {Object} oCard - Card object
		 */
        LayoutModel.prototype.getCardById = function (cardId) {
            var oCard = null, i = 0;
            for (i = 0; i < this.aCards.length; i++) {
                oCard = this.aCards[i];
                if (oCard.id === cardId) {
                    break;
                }
            }
            return oCard;
        };

		/**
		 * get the DashboardLayout variants in JSON format
		 * (only variants that were changed manually or originate from lrep)
		 *
		 * @method getLayoutVariants
		 * @returns {Object} JSON containing the layout variants
		 */
		LayoutModel.prototype.getLayoutVariants4Pers = function() {
			return JSON.parse(JSON.stringify(this.oLayoutVars));
		};

        /**
         * If the user has given variant details in the manifest then use the same variant
         * @method _readVariants
         */
        LayoutModel.prototype._readVariants = function () {
            var oVariant, item,
                oLayoutRaw = this.uiModel.getProperty('/dashboardLayout');
            function fnFilterElements (ele) {
                return ele.id === item;
            }
            if (!!oLayoutRaw) {
                //Copy the user given manifest settings for different layout like cols_3/cols_5/C3/C5
                for (var layoutKey in oLayoutRaw) {
                    if (oLayoutRaw.hasOwnProperty(layoutKey) && oLayoutRaw[layoutKey]) {
                        oVariant = oLayoutRaw[layoutKey];
                        oVariant.id = layoutKey;
                        for (item in oVariant) {
                            var oLayoutCard = this.oLayoutVars.filter(fnFilterElements);
                            //If the variant for the card already present
                            if (oLayoutCard.length > 0) {
                                //Remove all characters of the key except integer one
                                var sLayoutKey = 'C' + +oVariant.id.replace(/[^0-9\.]/g, "");
                                var oCardLayoutObj = oLayoutCard[0].dashboardLayout[sLayoutKey];
                                var oCard = this.aCards.filter(fnFilterElements);
                                if (Array.isArray(oCard) && oCard.length > 0) {
                                    //If variant for the same layout present then copy the values of row, col,colSpan and noOfItems
                                    if (oCardLayoutObj) {
                                        oCardLayoutObj.row = oVariant[item].row;
                                        oCardLayoutObj.col = oVariant[item].col;
                                        oCardLayoutObj.colSpan = oCard[0].template === 'sap.ovp.cards.stack' ? 1 : Math.min(oVariant[item].colSpan, this.iColCount);
                                        oCardLayoutObj.maxColSpan = oVariant[item].maxColSpan;
                                        oCardLayoutObj.noOfItems = oVariant[item].rowSpan;
                                    } else {
                                        //Else create the layout with the values of row, col,colSpan and noOfItems
                                        oLayoutCard[0].dashboardLayout[sLayoutKey] = {
                                            row: oVariant[item].row,
                                            col: oVariant[item].col,
                                            colSpan: oCard[0].template === 'sap.ovp.cards.stack' ? 1 : Math.min(oVariant[item].colSpan, this.iColCount),
                                            maxColSpan: oVariant[item].maxColSpan,
                                            noOfItems: oVariant[item].rowSpan,
                                            autoSpan: oCard[0].template === 'sap.ovp.cards.stack' ? false : true
                                        };
                                    }
                                    oLayoutCard[0].visibility = oVariant[item].visible ? oVariant[item].visible : true;
                                }
                            }
                        }
                    }
                }
            }
        };

		/**
		 * drop layout variants and reload manifest variants
		 * @method resetToManifest
		 */
        LayoutModel.prototype.resetToManifest = function () {
            this.oLayoutVars = null;
            for (var i = 0; i < this.aCards.length; i++) {
                this.aCards[i].dashboardLayout = {};
            }
            this._buildGrid(/*bUseManifest*/ true);
        };

		/**
		 * find best matching layout variant (or create one) and update card dashboardLayout
		 *
		 * @method _buildGrid
		 * @param {Boolean} bUseManifest - use manifest layout variants for read variants (needed for reset)
		 */
        LayoutModel.prototype._buildGrid = function (bUseManifest) {
            if (this.aCards.length === 0 || bUseManifest) {
                //read cards if not yet done
                this.aCards = jQuery.extend(true, [], this.uiModel.getProperty("/cards"));
            }

            //if the layout is loaded for the first time or easyscan variant is provided
            if (bUseManifest || !this.oLayoutVars || (this.oLayoutVars[0] && !this.oLayoutVars[0].dashboardLayout)) {
                this.oLayoutVars = [];
                this._sliceSequenceSausage();
            } else {
                //If there is already a variant present
                this._sliceSequenceSausage(this.oLayoutVars);
            }
            //Use the variants given by user if present
            this._readVariants();
        };

        /**
         * Method to align a card in the layout if it's out of the layout or added for the first time
         *
         * @method _displaceCardToEnd
         * @param {Object} oCard - Card object containing all the properties
         */
        LayoutModel.prototype._displaceCardToEnd = function (oCard) {
            oCard.dashboardLayout.column = 1;
            if (!this.iDisplaceRow) {
                this.iDisplaceRow = this._findHighestOccupiedRow();
            }
            oCard.dashboardLayout.row = this.iDisplaceRow;
            this.iDisplaceRow += oCard.dashboardLayout.rowSpan;
            var oLayoutCard = this.oLayoutVars.filter(function (item) {
                return item.id === oCard.id;
            });
            //Copy the row value of card.dashboardLayout to variant
            if (oLayoutCard.length > 0) {
                oLayoutCard[0].dashboardLayout["C" + this.iColCount].row = oCard.dashboardLayout.row;
            }
        };

        /**
         * Method to set all the default properties for card in resizable layout. Properties are
         *                 1) rowSpan - Defines height of card
         *                 2) colSpan- Defines width of card
         *                 3) noOfItems - Defines how many items to be shown in card(applicable for List/Table/Link List card)
         *                 4) autoSpan - Defines card should grow automatically or it would have fixed height
         *                 5) visible - Defines visibility of card
         *                 6) itemHeight - Defines each item height shown in card(applicable for List/Table/Link List card)
         *                 7) headerHeight - Defines header height[All variation of header like Normal/KPI header, Tittle/Subtitle line length,
         *                                   showSortingInHeader/showFilterInHeader flag]
         *
         * @method _setCardSpanFromDefault
         * @param {Object} oCard - Card object containing all the properties and settings from manifest
         */
        LayoutModel.prototype._setCardSpanFromDefault = function (oCard) {
            if (!oCard.dashboardLayout) {
                oCard.dashboardLayout = {};
            }
            var oCardProp = this._getDefaultCardItemHeightAndCount(oCard);
            //No default span is mentioned so, no of items will be default
            if (!oCard.settings.defaultSpan) {
                if (oCard.template !== 'sap.ovp.cards.linklist') {
                    oCard.dashboardLayout.rowSpan = 12;
                }
                oCard.dashboardLayout.colSpan = 1;
                oCard.dashboardLayout.maxColSpan = 1;
                oCard.dashboardLayout.noOfItems = oCardProp.noOfItems;
                oCard.dashboardLayout.autoSpan = oCard.template === 'sap.ovp.cards.stack' ? false : true;
                oCard.dashboardLayout.showOnlyHeader = false;
            } else {
                //User wants to show till header
                if (oCard.settings.defaultSpan.showOnlyHeader) {
                    oCard.dashboardLayout.rowSpan = Math.ceil((oCardProp.headerHeight + 2 * this.iCardBorderPx) / this.iRowHeightPx);
                    oCard.dashboardLayout.noOfItems = 0;
                    oCard.dashboardLayout.autoSpan = false;
                    oCard.dashboardLayout.showOnlyHeader = true;
                } else {
                    if (oCard.template === 'sap.ovp.cards.linklist') {
                        oCard.dashboardLayout.rowSpan = oCard.settings.defaultSpan.rows ? oCard.settings.defaultSpan.rows : 1;
                        oCard.dashboardLayout.autoSpan = false;
                    } else {
                        oCard.dashboardLayout.rowSpan = 12;
                        oCard.dashboardLayout.autoSpan = true;
                    }
                    oCard.dashboardLayout.noOfItems = oCard.settings.defaultSpan.rows ? oCard.settings.defaultSpan.rows : oCardProp.noOfItems;
                    oCard.dashboardLayout.showOnlyHeader = false;
                }
                if (oCard.template === "sap.ovp.cards.stack") {
                    oCard.dashboardLayout.colSpan = 1;
                    oCard.dashboardLayout.autoSpan = false;
                } else {
                    oCard.dashboardLayout.colSpan = oCard.settings.defaultSpan.cols ? Math.min(oCard.settings.defaultSpan.cols, this.iColCount) : 1;
                }
                oCard.dashboardLayout.maxColSpan = oCard.settings.defaultSpan.cols ? oCard.settings.defaultSpan.cols : 1;
            }
            oCard.dashboardLayout.visible = true;
            oCard.dashboardLayout.itemHeight = oCardProp.itemHeight;
            oCard.dashboardLayout.headerHeight = oCardProp.headerHeight;
        };

        /**
         * Method to create variant for different column layouts like C2, C3,C5 and validate the layout
         *
         * @method _sliceSequenceSausage
         * @param {Object} oUseVariant - layout variant to use
         */
        LayoutModel.prototype._sliceSequenceSausage = function (oUseVariant) {
            var i = 0, j = 0, iCol = 0, iColEnd = 0, iMaxRows = 0, oCard = {}, aSliceCols = [], sCurrentLayoutKey = 'C' + this.iColCount, oPreviousLREPData;
            // array to remember occupied columns
            for (i = 0; i < this.iColCount; i++) {
                aSliceCols.push({
                    col: i + 1,
                    rows: 0
                });
            }
            function fnFilterCards(item) {
                return item.id === oCard.id;
            }

            function fnNotToFilterItem(sCurrentLayoutKey, item) {
                return item !== sCurrentLayoutKey;
            }
            for (i = 0; i < this.aCards.length; i++) {
                oCard = this.aCards[i];
                // span data from card settings
                if (!oCard.dashboardLayout) {
                    oCard.dashboardLayout = {};
                }
                if (!oUseVariant) {
                    //set defaults variant as there is no variant present
                    this._setCardSpanFromDefault(oCard);
                } else {
                    //else take the variant for particular card from the variants
                    var oLayoutCard = oUseVariant.filter(fnFilterCards);
                    //If the variant for the card already present
                    if (oLayoutCard.length > 0) {
                        var oCardDashboardObj = oLayoutCard[0].dashboardLayout,
                            oCardObj = oCardDashboardObj[sCurrentLayoutKey],
                            aLayoutkeys = Object.keys(oCardDashboardObj),
                            sOtherLayoutKey = aLayoutkeys.filter(fnNotToFilterItem.bind(this, sCurrentLayoutKey));
                        //If there is no layout present then read the variants for the previous layout e.g - In case you are loading C4 for the first time from C5
                        if (sOtherLayoutKey.length > 0) {
                            oPreviousLREPData = oCardDashboardObj[sOtherLayoutKey];
                            //If user is doing zoom in/ zoom out then previous variant will be empty
                            if (oPreviousLREPData) {
                                //Copy variant to the present layout except row and column as it can not be accomodated in all the cases
                                // e.g -  Loading C5 data to C2 layout and any card has colspan = 3/4/5
                                this._mergeLayoutVariants(oCard.dashboardLayout, oPreviousLREPData);
                            }
                        } else {
                            //If variant already present for the layout, then just copy
                            this._mergeLayoutVariants(oCard.dashboardLayout, oCardObj);
                            continue;
                        }
                    } else {
                        //There may be case where the card is newly added to manifest and there is no variant data present
                        //So crete new variant and push it
                        oCard.dashboardLayout.row = this.iDummyRow;
                        oCard.dashboardLayout.column = 1;
                        var dashboardLayoutObj = {};
                        var layoutKey = {
                            row: oCard.dashboardLayout.row,
                            col: oCard.dashboardLayout.column,
                            rowSpan: oCard.dashboardLayout.rowSpan,
                            colSpan: oCard.dashboardLayout.colSpan,
                            maxColSpan: oCard.dashboardLayout.maxColSpan,
                            noOfItems: oCard.dashboardLayout.noOfItems,
                            autoSpan: oCard.dashboardLayout.autoSpan,
                            showOnlyHeader: oCard.dashboardLayout.showOnlyHeader
                        };
                        dashboardLayoutObj[sCurrentLayoutKey] = layoutKey;
                        oUseVariant.push({
                            id: oCard.id,
                            visibility: oCard.dashboardLayout.visible,
                            selectedKey: oCard.settings.selectedKey,
                            dashboardLayout: dashboardLayoutObj
                        });
                        continue;
                    }
                }
                //Check that the card is not going out of the layout
                oCard.dashboardLayout.colSpan = oCard.dashboardLayout.maxColSpan;
                oCard.dashboardLayout.colSpan = oCard.dashboardLayout.colSpan > this.iColCount ? this.iColCount : oCard.dashboardLayout.colSpan;
                iCol = iColEnd < this.iColCount ? iColEnd + 1 : 1;

                //check end col
                if (iCol + oCard.dashboardLayout.colSpan - 1 > this.iColCount) {
                    oCard.dashboardLayout.colSpan = this.iColCount - iCol + 1;
                }
                iColEnd = iCol + oCard.dashboardLayout.colSpan - 1;
                oCard.dashboardLayout.column = iCol;

                // get max rows of all affected rows
                iMaxRows = 0;
                //If the card is hidden in another layout like C5,C3 then also move the card to the bottom.
                if (Array.isArray(oLayoutCard) && oLayoutCard.length > 0 && !oLayoutCard[0].visibility) {
                    oCard.dashboardLayout.row = this.iDummyRow;
                } else {
                    for (j = oCard.dashboardLayout.column; j < oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan; j++) {
                        if (aSliceCols[j - 1].rows > iMaxRows) {
                            iMaxRows = aSliceCols[j - 1].rows;
                        }
                    }
                    oCard.dashboardLayout.row = iMaxRows + 1;
                    // set rows count of all affected columns
                    for (j = oCard.dashboardLayout.column; j < oCard.dashboardLayout.column + oCard.dashboardLayout.colSpan; j++) {
                        aSliceCols[j - 1].rows = iMaxRows + oCard.dashboardLayout.rowSpan;
                    }
                }
            }
            this.extractCurrentLayoutVariant();
        };

        /**
         * Copy all dashboard layout properties from one object to other
         *
         * @method _mergeLayoutVariants
         * @param {Object} oSourceObject - source object from which has to copy
         * @param {Object} oDestinationObject - destination object on which to override
         */

        LayoutModel.prototype._mergeLayoutVariants = function (oSourceObject, oDestinationObject) {
            if (oDestinationObject.rowSpan) {
                oSourceObject.rowSpan = oDestinationObject.rowSpan;
            }
            if (oDestinationObject.colSpan) {
                oSourceObject.colSpan = oDestinationObject.colSpan;
            }
            if (oDestinationObject.maxColSpan) {
                oSourceObject.maxColSpan = oDestinationObject.maxColSpan;
            }
            if (oDestinationObject.noOfItems) {
                oSourceObject.noOfItems = oDestinationObject.noOfItems;
            }
            if (oDestinationObject.hasOwnProperty('autoSpan')) {
                oSourceObject.autoSpan = oDestinationObject.autoSpan;
            }
            if (oDestinationObject.row) {
                oSourceObject.row = oDestinationObject.row;
            }
            if (oDestinationObject.col) {
                oSourceObject.column = oDestinationObject.col;
            }
            if (oDestinationObject.hasOwnProperty('showOnlyHeader')) {
                oSourceObject.showOnlyHeader = oDestinationObject.showOnlyHeader;
            }
        };

		/**
		 * sort and order cards by row
		 *
		 * @method _sortCardsByRow
		 * @param {Array} aCards - cards array
		 */
		LayoutModel.prototype._sortCardsByRow = function(aCards) {

			//sort by columns and order in column
			aCards.sort(function(card1, card2) {
				//if one card has no layout data, the other one get's up
				if (!card1.dashboardLayout && card2.dashboardLayout) {
					return 1;
				} else if (card1.dashboardLayout && !card2.dashboardLayout) {
					return -1;
				}

				// defaults for cards without dashboardLayout data
				if (card1.dashboardLayout.column && card1.dashboardLayout.row && card1.dashboardLayout.row === card2.dashboardLayout.row) {
					if (card1.dashboardLayout.column < card2.dashboardLayout.column) {
						return -1;
					} else if (card1.dashboardLayout.column > card2.dashboardLayout.column) {
						return 1;
					}
				} else if (card1.dashboardLayout.row) {
					return card1.dashboardLayout.row - card2.dashboardLayout.row;
				} else {
					return 0;
				}
			});
		};

        /**
         * Method to handle resize of card
         *
         * @method {Public} resizeCard
         * @param {String} cardId - Card Id which is resized
         * @param {object} oSpan - Updated rowspan and colspan of the card
         * @param {boolean} bManualResize - Flag to check that if the card is resized by user or the initial loading
         * @param {object} aDragOrResizeChanges - Array to record personalization changes during resize
         * @return {Object}   {resizeCard : , affectedCards: } - Object containing the Updated card properties and affected cards
         */
        LayoutModel.prototype.resizeCard = function (cardId, oSpan, bManualResize, aDragOrResizeChanges) {

            var oRCard = this.getCardById(cardId);
            if (!oRCard) {
                return [];
            }
            var deltaH = oSpan.colSpan - oRCard.dashboardLayout.colSpan;
            var deltaV = oSpan.rowSpan - oRCard.dashboardLayout.rowSpan;
            oRCard.dashboardLayout.showOnlyHeader = oSpan.showOnlyHeader;

            if (deltaH === 0 && deltaV === 0) {
                return {
                    resizeCard: oRCard,
                    affectedCards: []
                };
            } else if (bManualResize && oRCard.dashboardLayout.autoSpan) {
                oRCard.dashboardLayout.autoSpan = false;
            }

            if (!bManualResize || (deltaV && deltaH === 0)) {
                this._arrangeCards(oRCard, {
                    "row": oSpan.rowSpan,
                    "column": oRCard.dashboardLayout.colSpan
                }, 'resize', aDragOrResizeChanges);
            } else {
                this._arrangeCards(oRCard, {
                    "row": oSpan.rowSpan,
                    "column": oSpan.colSpan
                }, 'resize', aDragOrResizeChanges);
            }
            return {
                resizeCard: oRCard,
                affectedCards: this._removeSpaceBeforeCard(aDragOrResizeChanges)
            };
        };

        /**
         * Method to remove the un-necessary spaces before card
         *
         * @method {Private} _removeSpaceBeforeCard
         * @return {Array of Objects} this.aCards - Updated position of array of cards object
         */
        LayoutModel.prototype._removeSpaceBeforeCard = function (aDragOrResizeChanges) {
            this._sortCardsByRow(this.aCards);
            var delta = {};

            for (var i = 1; i <= this.iColCount; i++) {
                delta[i] = 1;
            }

            for (var j = 0; j < this.aCards.length; j++) {
                var lowerLimit = this.aCards[j].dashboardLayout.column,
                    upperLimit = this.aCards[j].dashboardLayout.column + this.aCards[j].dashboardLayout.colSpan - 1;
                if (this.aCards[j].dashboardLayout.visible) {
                    //If the card at the new position is going out of the layout then recalculate the colSpan for the card
                    if (upperLimit > this.iColCount) {
                        upperLimit = this.iColCount;
                        var newColSpan = this.iColCount - this.aCards[j].dashboardLayout.column + 1;
                        if (aDragOrResizeChanges) {
                            aDragOrResizeChanges.push({
                                changeType: "dragOrResize",
                                content: {
                                    cardId: this.aCards[j].id,
                                    dashboardLayout: {
                                        colSpan: newColSpan,
                                        oldColSpan: this.aCards[j].dashboardLayout.colSpan
                                    }
                                },
                                isUserDependent: true
                            });
                        }
                        this.aCards[j].dashboardLayout.colSpan = newColSpan;
                    }
                    if (this.aCards[j].dashboardLayout.colSpan > 1) {
                        var tempArr = [];
                        for (var k = lowerLimit; k <= upperLimit; k++) {
                            tempArr.push(delta[k]);
                        }
                        var maxRow = Math.max.apply(Math, tempArr);
                        for (var l = lowerLimit; l <= upperLimit; l++) {
                            delta[l] = maxRow + this.aCards[j].dashboardLayout.rowSpan;
                        }
                        if (aDragOrResizeChanges && maxRow !== this.aCards[j].dashboardLayout.row) {
                            aDragOrResizeChanges.push({
                                changeType: "dragOrResize",
                                content: {
                                    cardId: this.aCards[j].id,
                                    dashboardLayout: {
                                        row: maxRow,
                                        oldRow: this.aCards[j].dashboardLayout.row
                                    }
                                },
                                isUserDependent: true
                            });
                        }
                        this.aCards[j].dashboardLayout.row = maxRow;
                    } else {
                        if ((this.aCards[j].dashboardLayout.row !== delta[lowerLimit])) {
                            if (aDragOrResizeChanges) {
                                aDragOrResizeChanges.push({
                                    changeType: "dragOrResize",
                                    content: {
                                        cardId: this.aCards[j].id,
                                        dashboardLayout: {
                                            row: delta[lowerLimit],
                                            oldRow: this.aCards[j].dashboardLayout.row
                                        }
                                    },
                                    isUserDependent: true
                                });
                            }
                            this.aCards[j].dashboardLayout.row = delta[lowerLimit];
                        }
                        delta[lowerLimit] = this.aCards[j].dashboardLayout.row + this.aCards[j].dashboardLayout.rowSpan;
                    }
                }
            }
            return this.aCards;
        };

        /**
         * Method called to update new position of cards upon drag or resize
         *
         * @method {Private} _arrangeCards
         * @param {Object} oCard - Card object
         * @param {Object} newCardPosition - If the card is dragged then newCardPosition is the new starting point of the card
         *                                 - If the card is resized then newCardPosition is the changes in the rowspan and colspan
         * @param {Boolean} dragOrResize - Flag to distiguish between drag and drop or resize
         */
        LayoutModel.prototype._arrangeCards = function (oCard, newCardPosition, dragOrResize, aDragOrResizeChanges) {
            var originalCardCopy = jQuery.extend(true, {}, oCard);
            var verticalDragFlag = false;
            if (dragOrResize === "drag" && oCard.dashboardLayout.column === newCardPosition.column &&
                newCardPosition.row !== oCard.dashboardLayout.row) {
                verticalDragFlag = true;
            }
            this._sortCardsByRow(this.aCards);
            var affectedCards = [];
            var flag = false;
            var oldRow;
            //If the card is dragged then newCardPosition is the new starting point of the card
            if (dragOrResize === "drag") {
                oCard.dashboardLayout.row = newCardPosition.row;
                oCard.dashboardLayout.column = newCardPosition.column;
                //If the card is resized then newCardPosition is the changes in the rowspan and colspan
            } else if (dragOrResize === "resize") {
                oCard.dashboardLayout.rowSpan = newCardPosition.row;
                oCard.dashboardLayout.colSpan = newCardPosition.column;
            }

            affectedCards.push(oCard);
            for (var i = 0; i < affectedCards.length; i++) {
                for (var j = 0; j < this.aCards.length; j++) {
                    if (affectedCards[i].id === this.aCards[j].id || !affectedCards[i].dashboardLayout.visible) {
                        continue;
                    } else {
                        flag = this._checkOverlapOfCards(affectedCards[i], this.aCards[j]);
                        if (flag === true) {
                            //In case you are dragging a card horizontally
                            if (verticalDragFlag) {
                                //To check for moving a card upward
                                if (newCardPosition.row < originalCardCopy.dashboardLayout.row && newCardPosition.row === this.aCards[j].dashboardLayout.row) {
                                    affectedCards[i].dashboardLayout.row = this.aCards[j].dashboardLayout.row;
                                    oldRow = this.aCards[j].dashboardLayout.row;
                                    this.aCards[j].dashboardLayout.row = affectedCards[i].dashboardLayout.row + affectedCards[i].dashboardLayout.rowSpan;
                                    if (aDragOrResizeChanges) {
                                        aDragOrResizeChanges.push({
                                            changeType: "dragOrResize",
                                            content: {
                                                cardId: this.aCards[j].id,
                                                dashboardLayout: {
                                                    row: this.aCards[j].dashboardLayout.row,
                                                    oldRow: oldRow
                                                }
                                            },
                                            isUserDependent: true
                                        });
                                    }
                                    //To check for moving a card downward
                                } else if (newCardPosition.row > originalCardCopy.dashboardLayout.row + this.aCards[j].dashboardLayout.rowSpan) {
                                    oldRow = this.aCards[j].dashboardLayout.row;
                                    this.aCards[j].dashboardLayout.row = originalCardCopy.dashboardLayout.row;
                                    affectedCards[i].dashboardLayout.row = this.aCards[j].dashboardLayout.row + this.aCards[j].dashboardLayout.rowSpan;
                                    affectedCards.push(affectedCards[i]);
                                    if (aDragOrResizeChanges) {
                                        aDragOrResizeChanges.push({
                                            changeType: "dragOrResize",
                                            content: {
                                                cardId: this.aCards[j].id,
                                                dashboardLayout: {
                                                    row: this.aCards[j].dashboardLayout.row,
                                                    oldRow: oldRow
                                                }
                                            },
                                            isUserDependent: true
                                        });
                                    }
                                }
                                //In case you are dragging a card vertically
                            } else {
                                oldRow = this.aCards[j].dashboardLayout.row;
                                this.aCards[j].dashboardLayout.row = affectedCards[i].dashboardLayout.row + affectedCards[i].dashboardLayout.rowSpan;
                                affectedCards.push(this.aCards[j]);
                                if (aDragOrResizeChanges) {
                                    aDragOrResizeChanges.push({
                                        changeType: "dragOrResize",
                                        content: {
                                            cardId: this.aCards[j].id,
                                            dashboardLayout: {
                                                row: this.aCards[j].dashboardLayout.row,
                                                oldRow: oldRow
                                            }
                                        },
                                        isUserDependent: true
                                    });
                                }
                            }
                        }
                    }
                }
            }
        };

        /**
         * Method to check that if two cards are colliding or not
         *
         * @method {Private} _checkOverlapOfCards
         * @param {Object} originalCard - Original card object
         * @param {Object} affectedCard - The card with which needs to be checked object
         * @return {Boolean} collideX && collideY - collide in x-direction and collide in y-direction
         */
        LayoutModel.prototype._checkOverlapOfCards = function (originalCard, affectedCard) {
            var originalCardStartRow = originalCard.dashboardLayout.row;
            var originalCardEndRow = originalCard.dashboardLayout.row + originalCard.dashboardLayout.rowSpan;
            var originalCardStartColumn = originalCard.dashboardLayout.column;
            var originalCardEndColumn = originalCard.dashboardLayout.column + originalCard.dashboardLayout.colSpan;

            var affectedCardStartRow = affectedCard.dashboardLayout.row;
            var affectedCardEndRow = affectedCard.dashboardLayout.row + affectedCard.dashboardLayout.rowSpan;
            var affectedCardStartColumn = affectedCard.dashboardLayout.column;
            var affectedCardEndColumn = affectedCard.dashboardLayout.column + affectedCard.dashboardLayout.colSpan;

            var collideX = false,
                collideY = false;
            //Collision in X-direction

            if ((affectedCardStartColumn >= originalCardStartColumn && affectedCardStartColumn < originalCardEndColumn) ||
                (affectedCardEndColumn > originalCardStartColumn && affectedCardEndColumn <= originalCardEndColumn) ||
                (affectedCardStartColumn <= originalCardStartColumn && affectedCardEndColumn >= originalCardEndColumn)) {
                collideX = true;
            }
            //Collision in Y-direction
            if ((affectedCardStartRow >= originalCardStartRow && affectedCardStartRow < originalCardEndRow) ||
                (affectedCardEndRow > originalCardStartRow && affectedCardEndRow <= originalCardEndRow) ||
                (affectedCardStartRow <= originalCardStartRow && affectedCardEndRow >= originalCardEndRow)) {
                collideY = true;
            }
            return collideX && collideY;
        };

		/**
		 * extract the current layout variant into a new object
		 *
		 * @method extractCurrentLayoutVariant
		 * @returns {Object} new object containing current layout variant data
		 */
        LayoutModel.prototype.extractCurrentLayoutVariant = function () {
            var i = 0;
            var oCard = {};
            var oCardVariant = [];

            function fnFilterCards (item) {
                return item.id === oCard.id;
            }
            for (i = 0; i < this.aCards.length; i++) {
                oCard = this.aCards[i];
                oCardVariant = this.oLayoutVars.filter(fnFilterCards);
                var dashboardLayoutObj = {};
                var cardProperties = {
                    row: oCard.dashboardLayout.row,
                    col: oCard.dashboardLayout.column,
                    rowSpan: oCard.dashboardLayout.rowSpan,
                    colSpan: oCard.dashboardLayout.colSpan,
                    maxColSpan: oCard.dashboardLayout.maxColSpan,
                    noOfItems: oCard.dashboardLayout.noOfItems,
                    autoSpan: oCard.dashboardLayout.autoSpan,
                    showOnlyHeader: oCard.dashboardLayout.showOnlyHeader
                };
                dashboardLayoutObj["C" + this.iColCount] = cardProperties;
                //If the variant for any card is not present at all
                if (!(Array.isArray(oCardVariant) && oCardVariant.length !== 0 )) {
                    this.oLayoutVars.push({
                        id: oCard.id,
                        visibility: oCard.dashboardLayout.visible,
                        selectedKey: oCard.settings.selectedKey,
                        dashboardLayout: dashboardLayoutObj
                    });
                } else {
                    oCardVariant[0].selectedKey = oCard.settings.selectedKey || oCardVariant[0].selectedKey;
                    oCardVariant[0].dashboardLayout = {};
                    oCardVariant[0].dashboardLayout["C" + this.iColCount] = cardProperties;
                }
            }
        };

		/**
         * Method which returns the highest occupied row in the layout
         *
         * @method _findHighestOccupiedRow
         * @return {Integer} iHighestRow - Highest ever row which is occupied in the layout
         */
        LayoutModel.prototype._findHighestOccupiedRow = function () {
            var iHighestRow = 0, maxHeightArr = [];

            function filterByColCount(element) {
                return element.dashboardLayout.column === iCount;
            }

            function findCardwithMaxRowCount(element, index, array) {
                return element.dashboardLayout.row ===
                    Math.max.apply(Math, array.map(function (ele) {
                        return ele.dashboardLayout.row;
                    }));
            }

            for (var iCount = 1; iCount <= this.iColCount; iCount++) {
                //get the list of cards for each column
                var aArray = this.aCards.filter(filterByColCount);
                if (!!aArray) {
                    //For particular column find the card which has row count is maximum
                    //if row count is maximum means the card is present at the bottom for that column
                    var oObj = aArray.filter(findCardwithMaxRowCount)[0];
                    if (!!oObj) {
                        //For each column push the column height into the array
                        //Height of the column = margin-top of the card which is present at bottom + height of the card which is present at bottom
                        maxHeightArr.push(+oObj.dashboardLayout.row + +oObj.dashboardLayout.rowSpan);
                    }
                }
            }
            //Take the maximum height from the array which is equal to the height of the container
            iHighestRow = Math.max.apply(Math, maxHeightArr.map(function (ele) {
                return ele;
            }));
            return iHighestRow;
        };

        /**
         * Method which returns no of items to display based upon card type / list type and flavour
         *
         * @method _getItemLength
         * @param {Object} oCard - card object which is the object of card properties model
         * @return {Integer} iNoOfItems - No of items to fetch in batch call(default)
         */
        LayoutModel.prototype._getDefaultCardItemHeightAndCount = function (oCardProperties) {
            var densityStyle = CommonUtils._setCardpropertyDensityAttribute();
            //the id build by Type-ListType-flavor
            var CARD_PROPERTY = {
                "List_condensed": {
                    itemLength: 5,
                    itemHeight: 64
                },
                "List_condensed_imageSupported_cozy": {
                    itemLength: 5,
                    itemHeight: 72
                },
                "List_condensed_imageSupported_compact": {
                    itemLength: 5,
                    itemHeight: 60
                },
                "List_extended": {
                    itemLength: 3,
                    itemHeight: 97
                },
                "List_condensed_bar": {
                    itemLength: 5,
                    itemHeight: 65
                },
                "List_extended_bar": {
                    itemLength: 3,
                    itemHeight: 95
                },
                "Table": {
                    itemLength: 5,
                    itemHeight: 62
                },
                "Linklist": {
                    itemLength: 6,
                    itemHeight: 0
                }
            };
            var headerHeight = {
                "KPIHeader": {
                    "1": {
                        "1": 158,
                        "2": 174
                    },
                    "2": {
                        "1": 179,
                        "2": 195
                    },
                    "3": {
                        "1": 201,
                        "2": 223
                    }
                }, "NormalHeader": {
                    "1": {
                        "1": 82,
                        "2": 98
                    },
                    "2": {
                        "1": 103,
                        "2": 119
                    },
                    "3": {
                        "1": 125,
                        "2": 141
                    }
                }
            };
            var SHOW_FILTER_IN_HEADER_HEIGHT = 22;
            var SHOW_SHORTING_IN_HEADER_HEIGHT = 21;
            var iHeaderHeight = 0;
            if (oCardProperties) {
                var cardType = oCardProperties.template,
                    listType = oCardProperties.settings.listType,
                    flavor = oCardProperties.settings.listFlavor,
                    imageSupported = oCardProperties.settings.imageSupported,
                    iNoOfItems = 0, iItemHeight = 0;
                if (cardType == "sap.ovp.cards.list") {
                    if (listType == "extended") {
                        if (flavor == "bar") {
                            iNoOfItems = CARD_PROPERTY["List_extended_bar"]["itemLength"];
                            iItemHeight = CARD_PROPERTY["List_extended_bar"]["itemHeight"];
                        } else {
                            iNoOfItems = CARD_PROPERTY["List_extended"]["itemLength"];
                            iItemHeight = CARD_PROPERTY["List_extended"]["itemHeight"];
                        }
                    } else {
                        if (flavor == "bar") {
                            iNoOfItems = CARD_PROPERTY["List_condensed_bar"]["itemLength"];
                            iItemHeight = CARD_PROPERTY["List_condensed_bar"]["itemHeight"];
                        } else {
                            if (imageSupported === 'true') {
                                if (densityStyle === 'cozy') {
                                    iItemHeight = CARD_PROPERTY["List_condensed_imageSupported_cozy"]["itemHeight"];
                                } else {
                                    iItemHeight = CARD_PROPERTY["List_condensed_imageSupported_compact"]["itemHeight"];
                                }
                            } else {
                                iItemHeight = CARD_PROPERTY["List_condensed"]["itemHeight"];
                            }
                            iNoOfItems = CARD_PROPERTY["List_condensed"]["itemLength"];
                        }
                    }
                } else if (cardType == "sap.ovp.cards.table") {
                    iNoOfItems = CARD_PROPERTY["Table"]["itemLength"];
                    iItemHeight = CARD_PROPERTY["Table"]["itemHeight"];
                } else if (cardType === "sap.ovp.cards.linklist") {
                    iNoOfItems = CARD_PROPERTY["Linklist"]["itemLength"];
                    iItemHeight = CARD_PROPERTY["Linklist"]["itemHeight"];
                }
                var titleRow = oCardProperties.settings.defaultSpan && oCardProperties.settings.defaultSpan.minimumTitleRow ? oCardProperties.settings.defaultSpan.minimumTitleRow : 1;
                var subTitleRow = oCardProperties.settings.defaultSpan && oCardProperties.settings.defaultSpan.minimumSubTitleRow ? oCardProperties.settings.defaultSpan.minimumSubTitleRow : 1;
                var headerType = (oCardProperties.settings.dataPointAnnotationPath || (oCardProperties.settings.tabs && oCardProperties.settings.tabs[0].dataPointAnnotationPath)) ? "KPIHeader" : "NormalHeader";
                iHeaderHeight = headerHeight[headerType][titleRow][subTitleRow];
                if (headerType === "KPIHeader") {
                    if (oCardProperties.settings.showFilterInHeader === true) {
                        iHeaderHeight += SHOW_FILTER_IN_HEADER_HEIGHT;
                    }
                    if (oCardProperties.settings.showSortingInHeader === true) {
                        iHeaderHeight += SHOW_SHORTING_IN_HEADER_HEIGHT;
                    }
                }
                return {
                    noOfItems: iNoOfItems,
                    itemHeight: iItemHeight,
                    headerHeight: iHeaderHeight
                };
            }
        };

		return LayoutModel;

	}, /* bExport= */ true);