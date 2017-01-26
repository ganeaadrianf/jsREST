$(document).ready(function () {



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

            function createTaskFor(userId){

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
            data:JSON.stringify({
                "__metadata":{type:"SP.List"},
                BaseTemplate:SP.ListTemplateType.tasks,
                Title:"AG-Tasks"
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
            $("#message").html(jqXHR.responseText+" | "+textStatus+" | "+errorThrown);
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
                html += "<li>" + value.Title+ "</li>";

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
            var html = "Lists inside "+data.d.Title;
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
                Accept:"application/json;odata=verbose"
            }
        })
        .done(function (data, textStatus, jqXHR) {
            var html = "";
            $.each(data.d.results, function (index, value) {
                html += "<li>" + value.Title + " | hidden: " + value.Hidden + " | ItemCount: " + value.ItemCount + "</li>";
                    
            });
            $("#message").html("<ul>"+html+"</ul>");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $("#message").html(jqXHR.responseText + " | " + textStatus + " | " + errorThrown);
        });
    });
});


