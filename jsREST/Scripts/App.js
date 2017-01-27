$(document).ready(function () {
    var hostWebUrl;
    var appWebUrl;
    appWebUrl = decodeURIComponent($.getUrlVar("SPAppWebUrl"));
    hostWebUrl = decodeURIComponent($.getUrlVar("SPHostUrl"));

    var scriptbase = hostWebUrl + "/_layouts/15/";


    $.getScript(scriptbase + "SP.RequestExecutor.js", getAllHostWebPropsUsingREST);


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

