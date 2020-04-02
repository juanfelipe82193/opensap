window.addEventListener("load", function () {
    // require dialog module
    jQuery.sap.require("sap.ca.ui.HierarchicalSelectDialog");

    // set global models
    var mJSON = new sap.ui.model.json.JSONModel({
        "WorkItems": [
            {
                name: "WorkItem_1",
                description: "My_WorkItem1",
                ItemDetails: [
                    {
                        name: "WI-1-Item-1",
                        description: "First subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-1-I-1-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-1-I-1-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    },
                    {
                        name: "WI-1-Item-2",
                        description: "Other subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-1-I-2-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-1-I-2-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    }
                ]
            },
            {
                name: "WorkItem_2",
                description: "My other workitem",
                ItemDetails: [
                    {
                        name: "WI-2-Item-1",
                        description: "First subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-2-I-1-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-2-I-1-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    },
                    {
                        name: "WI-2-Item-2",
                        description: "Other subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-2-I-2-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-2-I-2-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    }
                ]
            },
            {
                name: "WorkItem_3",
                description: "My third workitem",
                ItemDetails: [
                    {
                        name: "WI-3-Item-1",
                        description: "First subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-3-I-1-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-3-I-1-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    },
                    {
                        name: "WI-1-Item-2",
                        description: "Other subitem",
                        ItemSubDetails: [
                            {
                                name: "WI-3-I-2-Sub-1",
                                description: "Sub item detail 1"
                            },
                            {
                                name: "WI-3-I-2-Sub-2",
                                description: "Sub item detail 2"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    var xml = '<ui:HierarchicalSelectDialog' +
        ' xmlns="sap.m" xmlns:ui="sap.ca.ui"' +
        ' title="Hierarchical Select Dialog"  ' +
        ' width="300px"                       ' +
        ' height="300px"                      ' +
        ' select="onItemSelected"             ' +
        ' cancel="onCancel">                  ' +
        '        <ui:HierarchicalSelectDialogItem title="Work Items" entityName="json>/WorkItems">' +
        '        <ui:listItemTemplate>                                                             ' +
        '<StandardListItem title="{json>name}" description="{json>description}" icon="sap-icon://lab"/>' +
        '        </ui:listItemTemplate>                                                                 ' +
        '        </ui:HierarchicalSelectDialogItem>                                                     ' +
        '        <ui:HierarchicalSelectDialogItem title="Page 2" entityName="json>ItemDetails">         ' +
        '        <ui:listItemTemplate>                                                                  ' +
        '<StandardListItem title="{json>name}" description="{json>description}" icon="sap-icon://lab"/> ' +
        '        </ui:listItemTemplate>                                                                 ' +
        '        </ui:HierarchicalSelectDialogItem>                                                     ' +
        '        <ui:HierarchicalSelectDialogItem title="Page 3" entityName="json>ItemSubDetails">      ' +
        '        <ui:listItemTemplate>                                                                  ' +
        '<StandardListItem title="{json>name}" description="{json>description}" icon="sap-icon://lab"/> ' +
        '        </ui:listItemTemplate>                                                                 ' +
        '        </ui:HierarchicalSelectDialogItem>                                                     ' +
        '        </ui:HierarchicalSelectDialog>                                                         ';

    oHierchicalSelectDialog = sap.ui.xmlfragment({id: HIERARCHY_SELECT_DIALOG_ID, fragmentContent: xml}, this);

    oHierchicalSelectDialog.setModel(mJSON, "json");

    var oButton = new sap.m.Button({
        id: "ButtonId",
        tap: function () {
            oHierchicalSelectDialog.open()
        },
        text: "Open Dialog"
    });

    var oHtml = new sap.ui.core.HTML({
        content: '<h1 id="qunit-header">Fiori Wave 2: Test Page for Hierarchical Select Dialog</h1>' +
            '<h2 id="qunit-banner"></h2>' +
            '<h2 id="qunit-userAgent"></h2>' +
            '<ol id="qunit-tests"></ol>' +
            '<h4></h4>' +
            '<h5>Button to display Hierarchical Select Dialog Box</h5>' +
            '<div id="contentHolder"></div>',
        afterRendering: function () {
            oButton.placeAt("contentHolder");
        }
    });

    var app = new sap.m.App("myApp", {
        initialPage: "myFirstPage"
    });

    var page = new sap.m.Page("myFirstPage", {
        title: "Fiori - Hierarchical Select Dialog",
        showNavButton: true,
        enableScrolling: true,
        content: oHtml
    });
    app.addPage(page).placeAt("content");

///////////////
//Testing Part: Hierarchical Select Dialog
///////////////
    var HIERARCHY_SELECT_DIALOG_ID = "CA_VIEW_HIERARCHYSELECTDIALOG--HIERARCHYSELECTDIALOG";

    module("HierarchicalSelectDialog - Properties tests");

    test("HierarchicalSelectDialog - Creation ", function () {
        var oHierarchicalSelectDialog = new sap.ca.ui.HierarchicalSelectDialog({id: HIERARCHY_SELECT_DIALOG_ID});
        notEqual(oHierarchicalSelectDialog, undefined, "The HierarchicalSelectDialog control should exist");
        strictEqual(oHierarchicalSelectDialog.getId(), HIERARCHY_SELECT_DIALOG_ID, "The HierarchicalSelectDialogItem should have ID = " + HIERARCHY_SELECT_DIALOG_ID);
    });

    module("HierarchicalSelectDialog - Events tests");

// Use the search field
    asyncTest("HierarchicalSelectDialog - Search", function () {
        expect(6);

        var core = sap.ui.getCore();
        var oButton = core.byId("ButtonId");
        // Open the Dialog
        oButton.fireTap();

        // asserts in 300ms
        setTimeout(function () {

            ok(true, "Passed and ready to resume!");

            // Check visibility
            equals(jQuery("#__dialog0").css("visibility"), "visible", "The HierarchicalSelectDialog should be visible after opening");

            setTimeout(function () {
                // Fill The search field and check that the filter works
                var oSearchField = core.byId("p0-searchfield");

                var bEventHandlerCalled = false;
                var handler = function (oControlEvent) {
                    bEventHandlerCalled = true;
                    // Check The search value
                    equals(oControlEvent.getParameter("newValue"), "third", "Value of livechange event:");
                    oSearchField.detachSearch(handler);
                };
                oSearchField.attachLiveChange(handler);

                // simulate user value "third"
                var aKeys = ["t", "h", "i", "r", "d"];
                for (var i = 0; i < aKeys.length; i++) {
                    sap.ui.test.qunit.triggerCharacterInput(oSearchField.getFocusDomRef(), aKeys[i]);
                    sap.ui.test.qunit.triggerKeyEvent("keyup", oSearchField.getFocusDomRef(), aKeys[i]);
                }

                oSearchField.setValue("third");
                oSearchField.fireLiveChange({newValue: oSearchField.getValue()});

                oSearchField.detachLiveChange(handler);
                ok(bEventHandlerCalled, "LiveChange handler called.");

                setTimeout(function () {

                    ok(true, "Passed and ready to resume 2!");
                    var oLine = sap.ui.getCore().byId("__item0-p0list-0");
                    strictEqual(oLine.getTitle(), "WorkItem_3", "The result of 'third' search should be 'the WorkItem_3'");
                    start();
                }, 500);
            }, 500);
        }, 500);
    });

// Navigate to the last child.
    asyncTest("HierarchicalSelectDialog - Navigate", function () {
        expect(13);

        var core = sap.ui.getCore();
        var oButton = core.byId("ButtonId");
        // Open the Dialog
        oButton.fireTap();

        // asserts in 500ms
        setTimeout(function () {
            ok(true, "Passed and ready to resume!");

            var oSearchField = core.byId("p0-searchfield");
            oSearchField.setValue("");
            oSearchField.fireLiveChange({newValue: oSearchField.getValue()});

            // Check Title value
            var oTitleText = core.byId("p0-title").getText();
            equals(oTitleText, "Work Items", "The Navigation title should be 'Work Items' now");

            // Navigate using the first item.
            var oItem = core.byId("__item0-p0list-0");
            oItem.firePress();

            // asserts in 500ms
            setTimeout(function () {
                ok(true, "Passed and ready to resume 2!");

                // Check Title value
                var oTitleText = core.byId("p1-title").getText();
                equals(oTitleText, "WorkItem_1", "The Navigation title should be 'WorkItem_1' now");

                //Check Page 1 Enabled
                var oHiddenPages = document.getElementsByClassName("sapMNavItem sapMPage sapMPageBgStandard sapMPageWithHeader sapMPageWithSubHeader sapMNavItemHidden");
                equals(oHiddenPages[0].id, "p0", "Page 0 should be disabled now");

                // Navigate using the first sub-item.
                var oItem = core.byId("__item2-p1list-0");
                oItem.firePress();

                // asserts in 500ms
                setTimeout(function () {
                    ok(true, "Passed and ready to resume 3!");

                    // Check Title value
                    var oTitleText = core.byId("p2-title").getText();
                    equals(oTitleText, "WI-1-Item-1", "The Navigation title text should be 'WI-1-Item-1' now");

                    // Check only page 2 is visible
                    var oHiddenPages = document.getElementsByClassName("sapMNavItem sapMPage sapMPageBgStandard sapMPageWithHeader sapMPageWithSubHeader sapMNavItemHidden");
                    equals(oHiddenPages[0].id, "p0", "Page 0 should be disabled now");
                    equals(oHiddenPages[1].id, "p1", "Page 1 should be disabled now");

                    // Navigate using the first sub-sub-item.
                    var oItem = core.byId("__item4-p2list-0");
                    oItem.firePress();

                    // asserts in 500ms
                    setTimeout(function () {
                        ok(true, "Passed and ready to resume 4!");

                        // Check that Box is closed
                        // Destroy object
                        var oDialog = sap.ui.getCore().byId("__dialog0");
                        oDialog.destroy();

                        ok(oDialog.$().size() == 0, "DOM content destroyed");

                        // try to find destroyed object
                        setTimeout(function () {

                            var oDialog2 = new sap.ca.ui.HierarchicalSelectDialog("__dialog0");
                            ok(oDialog2, "UI5 Object still can be found");
                            ok(oDialog2.$().size() == 0, "But DOM content is still destroyed");

                            start();
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    });
});
