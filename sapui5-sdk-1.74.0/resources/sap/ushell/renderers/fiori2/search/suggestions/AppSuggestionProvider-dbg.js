// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/* global jQuery, sap*/

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/SearchHelper',
    'sap/ushell/renderers/fiori2/search/suggestions/SuggestionProvider',
    'sap/ushell/renderers/fiori2/search/suggestions/SuggestionType'
], function (SearchHelper, SuggestionProvider, SuggestionType) {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider');

    // =======================================================================
    // apps suggestions provider
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider = function () {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new SuggestionProvider(), {

        init: function (params) {
            // call super constructor
            SuggestionProvider.prototype.init.apply(this, arguments);
            // decorate suggestion methods (decorator prevents request overtaking)
            this.suggestApplications = SearchHelper.refuseOutdatedRequests(this.suggestApplications);
        },

        abortSuggestions: function () {
            this.suggestApplications.abort();
        },

        combineSuggestionsWithIdenticalTitle: function (suggestions) {

            //            function JSONStringifyReplacer(key, value) {
            //                if (key === "sina") {
            //                    return undefined;
            //                }
            //                return value;
            //            }

            // collect suggestions in suggestionsTitleDict + create combined suggestions
            var suggestion;
            var suggestionsTitleDict = {};
            for (var i = 0; i < suggestions.length; i++) {
                suggestion = suggestions[i];
                var firstAppSuggestion = suggestionsTitleDict[suggestion.title + suggestion.subtitle];
                if (firstAppSuggestion) {

                    if (!firstAppSuggestion.combinedSuggestionExists) {
                        var combinedSuggestion = {
                            title: 'combinedAppSuggestion' + i,
                            subtitle: suggestion.subtitle,
                            sortIndex: firstAppSuggestion.sortIndex,
                            url: this.model.searchUrlParser.renderFromParameters(this.model.appTopDefault, this.model.sinaNext.createFilter({
                                dataSource: this.model.appDataSource,
                                searchTerm: suggestion.title
                            }), false),
                            label: sap.ushell.resources.i18n.getText("suggestion_in_apps", suggestion.label),
                            icon: ""
                        };
                        var inApps = sap.ushell.resources.i18n.getText("suggestion_in_apps", [""]);
                        combinedSuggestion.label = combinedSuggestion.label.replace(inApps, "<i>" + inApps + "</i>");
                        suggestionsTitleDict[combinedSuggestion.title + combinedSuggestion.subtitle] = combinedSuggestion;
                        firstAppSuggestion.combinedSuggestionExists = true;
                    }

                } else {
                    suggestion.sortIndex = i;
                    suggestionsTitleDict[suggestion.title + suggestion.subtitle] = suggestion;
                }
            }

            // filter out combined suggestions
            suggestions = [];
            for (var suggestionTitle in suggestionsTitleDict) {
                if (suggestionsTitleDict.hasOwnProperty(suggestionTitle)) {
                    suggestion = suggestionsTitleDict[suggestionTitle];
                    if (!suggestion.combinedSuggestionExists) {
                        suggestions.push(suggestion);
                    }
                }
            }
            suggestions.sort(function (s1, s2) {
                return s1.sortIndex - s2.sortIndex;
            });

            return suggestions;

        },

        addAsterisk4ShowAllApps: function (searchTerms) {
            var newSearchTerms = searchTerms;

            searchTerms = searchTerms.match(/\S+/g);
            if (searchTerms.length > 0) {
                var searchTerm;
                var searchTermsArray = [];
                for (var i = 0; i < searchTerms.length; i++) {
                    searchTerm = searchTerms[i];
                    if (searchTerm && searchTerm.lastIndexOf('*') !== searchTerm.length - 1) {
                        searchTermsArray.push(searchTerm + '*');
                    } else {
                        searchTermsArray.push(searchTerm);
                    }
                }
                newSearchTerms = searchTermsArray.join(' ');
            }

            return newSearchTerms;
        },

        createShowMoreSuggestion: function (totalResults) {
            var title = sap.ushell.resources.i18n.getText("showAllNApps", totalResults);
            title = title.replace(/"/g, ""); //remove trailing ""
            var tooltip = title;
            var label = "<i>" + title + "</i>";
            return {
                title: title,
                tooltip: tooltip,
                label: label,
                dataSource: this.model.appDataSource,
                labelRaw: this.model.getProperty("/uiFilter/searchTerm"),
                uiSuggestionType: SuggestionType.SearchTermData,
                searchTerm: this.model.getProperty("/uiFilter/searchTerm") || ''
            };
        },

        getSuggestions: function () {
            var that = this;

            // check that datasource is all or apps
            var dataSource = that.model.getDataSource();
            if (dataSource !== that.model.allDataSource &&
                dataSource !== that.model.appDataSource) {
                return jQuery.when([]);
            }

            // get suggestions
            var suggestionTerm = that.model.getProperty('/uiFilter/searchTerm');
            return that.suggestApplications(suggestionTerm)
                .then(function (resultset) {

                    // combine suggestions with identical title
                    var appSuggestions = resultset.getElements();
                    appSuggestions = that.combineSuggestionsWithIdenticalTitle(appSuggestions);

                    // set type, datasource and position
                    jQuery.each(appSuggestions, function (index, appSuggestion) {
                        appSuggestion.uiSuggestionType = SuggestionType.App;
                        appSuggestion.dataSource = that.model.appDataSource;
                        appSuggestion.position = SuggestionType.properties.App.position;
                        appSuggestion.key = SuggestionType.App + appSuggestion.url + appSuggestion.icon;
                    });

                    // limit app suggestions
                    var appSuggestionLimit = that.suggestionHandler.getSuggestionLimit(SuggestionType.App);
                    appSuggestions = appSuggestions.slice(0, appSuggestionLimit);

                    // if there are more apps available, add a "show all apps" suggestion at the end
                    // but only if datasource is apps (nestle changes)
                    if (resultset.totalResults > appSuggestionLimit && dataSource === that.model.appDataSource) {
                        appSuggestions.push(that.createShowMoreSuggestion(resultset.totalResults));
                    }

                    return appSuggestions;
                });
        },

        suggestApplications: function (searchTerm) {
            return sap.ushell.Container.getService("Search").queryApplications({
                searchTerm: searchTerm,
                suggestion: true
            });
        }

    });

    return module;
});
