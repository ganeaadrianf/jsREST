$(document).ready(function () {

    $.ajaxSetup({
        error: function (jqXHR, status, error) {
            $("#message").html("An error occurred: " + status + "<br/>Error: " + error + " - " + JSON.parse(jqXHR.responseText).error.message.value);
        },
        headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        }
    });

    $("#btnUserProfileProperties").click(function () {

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=DisplayName,UserProfileProperties",
            type: "Get",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
    .done(function (data, textStatus, jqXHR) {
        var html = String.format("Profile properties for: {0}" + data.d.DisplayName);
        $.each(data.d.UserProfileProperties.results, function () {
            if (this.Value != "") {
                html += "<br/>" + this.Key + ":" + this.Value;
            }
        });

        $("#message").html(html);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
    });


    });



    $("#btnCheckUserPermissions").click(function () {

        var call1 = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/effectivebasepermissions",
            type: "GET"
        });
        var call2 = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Products')/effectivebasepermissions",
            type: "GET"
        });

        var calls = $.when(call1, call2);
        calls.done(function (callback1, callback2) {
            var manageLists = new SP.BasePermissions();
            manageLists.initPropertiesFromJson(callback1[0].d.EffectiveBasePermissions);
            var addListItems = new SP.BasePermissions();
            addListItems.initPropertiesFromJson(callback2[0].d.EffectiveBasePermissions);

            var manageListsPerms = manageLists.has(SP.PermissionKind.manageLists);
            var addListItemsPerms = addListItems.has(SP.PermissionKind.addListItems);

            $("#message").html("Manage Lists: " + manageListsPerms + "<br/>Add list items: " + addListItemsPerms);

        });


    });


    $("#btnUploadDocument").click(function () {
        if (!window.FileReader) {
            alert("HTML5 unavailable");
            return;
        }




        var upload = document.getElementById("btnUploadFile");
        var file = upload.files[0];




        var reader = new FileReader();

        reader.onload = function (e) {
            //save to list
            var buffer = e.target.result;

            var url = String.format("{0}/_api/web/lists/getByTitle('{1}')/RootFolder/Files/Add(url='{2}',overwrite=true)", _spPageContextInfo.webAbsoluteUrl, "Project Documents REST", file.name);
            var call = $.ajax({
                url: url,
                type: "POST",
                data: buffer,
                processContent: false,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "Content-Length": buffer.byteLength
                }
            });

            call.done(function () {
                $("#message").html("Document successfuly uploaded");
            });

            call.fail(function (jqXHR, textStatus, errorThrown) {
                $("#message").html("<p class='error'>" + jqXHR.responseText + " | " + textStatus + " | " + errorThrown + "</p>");
            });

        }


        reader.onerror = function (e) {
            alert("Error reading the file: " + e.target.error);

        }




        reader.readAsArrayBuffer(file);




    });

    $("#btnCreateLibrary").click(function () {
        deleteList("Project Documents REST");
        var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists",
            type: "POST",
            data: JSON.stringify({
                "__metadata": { type: "SP.List" },
                Title: "Project Documents REST",
                BaseTemplate: SP.ListTemplateType.documentLibrary
            })
        });
        call.done(function (data, status, jqXHR) {
            var callAddYearColumn = addYearColumn();
            callAddYearColumn.done(function () {
                var callAddUserColumn = addUserColumn();
                callAddUserColumn.done(function () {
                    $("#message").html("<a href='../Project Documents REST/' target='_blank'>Document Library</a> created");
                });
                callAddUserColumn.fail(function () {
                    deleteList("Project Documents REST");
                });
            });
            callAddYearColumn.fail(function () {
                deleteList("Project Documents REST");
            });

        });
    });


    function addYearColumn() {
        var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Project Documents REST')/fields",
            type: "POST",
            data: JSON.stringify({
                "__metadata": { type: "SP.FieldNumber" },
                Title: "Year",
                FieldTypeKind: SP.FieldType.integer,
                MinimumValue: 2000,
                MaximumValue: 2900
            })
        });

        return call;

    }

    function addUserColumn() {
        var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Project Documents REST')/fields",
            type: "POST",
            data: JSON.stringify({
                "__metadata": { type: "SP.FieldUser" },
                Title: "Coordinator",
                FieldTypeKind: SP.FieldType.user
            })
        });

        return call;

    }


    function deleteList(listTitle) {
        var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listTitle + "')",
            type: "DELETE",
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*"
            }
        });

        call.done(function () {
            $("#message").html("List " + listTitle + " successfuly deleted");
        });
    }

    var hostWebUrl;
    var appWebUrl;
    appWebUrl = decodeURIComponent($.getUrlVar("SPAppWebUrl"));
    hostWebUrl = decodeURIComponent($.getUrlVar("SPHostUrl"));

    var scriptbase = hostWebUrl + "/_layouts/15/";


    $.getScript(scriptbase + "SP.RequestExecutor.js", getAllHostWebPropsUsingREST);


    $("#btnRetrieveRemoteWebListCrossSiteLibrary").click(function () {
        var targetUrl = "http://intranet.shpdev.com";

        var url = appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('Categories')/items?" +
            "@target='" + targetUrl + "'";

        var executor = new SP.RequestExecutor(appWebUrl);
        executor.executeAsync({
            url: url,
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" }, // return data format
            success: function (data) {
                // parse the returned data
                var body = JSON.parse(data.body);
                $("#message").html("Found " + body.d.results.length + " items.");
            },
            error: function (data) {
                $("#message").html("Failed to read items.");
            }
        });

    });

    $("#btnRetrieveRemotetWebList").click(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.WebProxy.invoke",
            type: "POST",
            data: JSON.stringify({
                requestInfo: {
                    "__metadata": { type: "SP.WebRequestInfo" },
                    "Url": "http://intranet.shpdev.com/_api/web/lists/getByTitle('Categories')/items?$format=json",
                    "Method": "GET"
                }
            }),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        })
        .done(function (data, textStatus, jqXHR) {
            var html = "List items from remote web:";
            $.each(data.d.Invoke.Body.d.results, function (index, value) {
                html += "<li>" + value.Title + " | ID: " + value.ID;

            });
            $("#message").html(html);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });

    $("#btnUpdateListItem").click(function () {

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists/getByTitle('AG-Tasks')/items?$skiptoken=Paged=TRUE&p_ID=1&$top=1",
            type: "Get",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            updateItem(data.d.results[0]);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });

        function updateItem(item) {

            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists/getByTitle('AG-Tasks')/items(" + item.Id + ")",
                type: "POST",
                data: JSON.stringify({
                    "__metadata": { type: "SP.Data.AGTasksListItem" },
                    Title: "modified through REST"
                }),
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "PATCH",
                    "IF-MATCH": item.__metadata.etag

                }
            })
           .done(function (data, textStatus, jqXHR) {
               $("#message").html("List item updated");
           })
           .fail(function (jqXHR, textStatus, errorThrown) {
               $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
           });
        }

    });


    $("#btnCreateListItem").click(function () {

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web?$select=Title,CurrentUser/Title,CurrentUser/Id&$expand=CurrentUser",
            type: "Get",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            createTaskFor(data.d.CurrentUser.Id);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });

        function createTaskFor(userId) {

            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists/getByTitle('AG-Tasks')/items",
                type: "POST",
                data: JSON.stringify({
                    "__metadata": { type: "SP.Data.AGTasksListItem" },
                    AssignedToId: userId,
                    Title: "added through REST"
                }),
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()

                }
            })
           .done(function (data, textStatus, jqXHR) {
               $("#message").html("List item created");
           })
           .fail(function (jqXHR, textStatus, errorThrown) {
               $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
           });
        }

    });






    $("#btnCreateList").click(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists",
            type: "POST",
            data: JSON.stringify({
                "__metadata": { type: "SP.List" },
                BaseTemplate: SP.ListTemplateType.tasks,
                Title: "AG-Tasks"
            }),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()

            }
        })
        .done(function (data, textStatus, jqXHR) {
            $("#message").html("List created");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });


    $("#btnExpandCategory").click(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists/getByTitle('Products')/Items?$select=Title,Category/Title&$filter=(Category/Title eq 'Beverages')&$expand=Category/Title",
            type: "GET",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            var html = "Beverages items:";
            $.each(data.d.results, function (index, value) {
                html += "<li>" + value.Title + "</li>";

            });
            $("#message").html("<ul>" + html + "</ul>");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });

    $("#btnExpandCollections").click(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web?$select=Title,Lists/Title,Lists/ItemCount,Lists/Hidden&$expand=Lists",
            type: "GET",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            var html = "Lists inside " + data.d.Title;
            $.each(data.d.Lists.results, function (index, value) {
                html += "<li>" + value.Title + " | hidden: " + value.Hidden + " | ItemCount: " + value.ItemCount + "</li>";

            });
            $("#message").html("<ul>" + html + "</ul>");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });


    $("#btnGetLists").click(function () {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists?$select=Title,Hidden,ItemCount&$filter=((Hidden eq false) and (ItemCount gt 0))",
            type: "GET",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            var html = "";
            $.each(data.d.results, function (index, value) {
                html += "<li>" + value.Title + " | hidden: " + value.Hidden + " | ItemCount: " + value.ItemCount + "</li>";

            });
            $("#message").html("<ul>" + html + "</ul>");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });

    $("#btnInspectRequest").click(function () {

        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/Lists/getByTitle('AG-Tasks')/items(1)",
            type: "Get",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            $("#message").html("completed request ca be inspected using fiddler");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });



    });



    function getAllHostWebPropsUsingREST() {
        var executor;

        // although we're fetching data from the host web, SP.RequestExecutor gets initialized with the app web URL..
        executor = new SP.RequestExecutor(appWebUrl);
        executor.executeAsync(
            {
                url:
                    appWebUrl +
                    "/_api/SP.AppContextSite(@target)/web/?@target='" + hostWebUrl + "'",
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: onGetAllHostWebPropsUsingRESTSuccess,
                error: onGetAllHostWebPropsUsingRESTFail
            }
        );
    }

    function onGetAllHostWebPropsUsingRESTSuccess(data) {
        var jsonObject = JSON.parse(data.body);
        // note that here our jsonObject.d object (representing the web) has ALL properties because 
        // we did not select specific ones in our REST URL. However, we're just displaying the web title here..
        $('#message').text(jsonObject.d.Title);
    }

    function onGetAllHostWebPropsUsingRESTFail(data, errorCode, errorMessage) {
        alert('Failed to get host site. Error:' + errorMessage);
    }



});


// jQuery plugin for fetching querystring parameters..
jQuery.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name) {
        return jQuery.getUrlVars()[name];
    }
});

