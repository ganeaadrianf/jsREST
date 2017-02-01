<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <b style="color: #c00">Testing apps for sharepoint v2</b>
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <style>
        .error {
            font-weight: bold;
            color: #c00;
        }
    </style>
    <div>
        <p id="message">
            <!-- The following content will be replaced with the user name when you run the app - see App.js -->
            initializing...
        </p>


        <input id="btnInspectRequest" type="button" value="Inspect request" /><br />
        <input id="btnGetLists" type="button" value="Lists" /><br />
        <input id="btnExpandCollections" type="button" value="Expand collections" /><br />
        <input id="btnExpandCategory" type="button" value="Expand beverages" /><br />
        <input id="btnCreateList" type="button" value="Create list" /><br />
        <input id="btnCreateListItem" type="button" value="Create list item" /><br />
        <input id="btnUpdateListItem" type="button" value="Update list item" /><br />
        <input id="btnRetrieveRemotetWebList" type="button" value="Retrieve list from remote web -WebProxy(Anonymous services)" /><br />
        <input id="btnRetrieveRemoteWebListCrossSiteLibrary" type="button" value="Retrieve list from remote web - Cross site library" /><br />
        <input id="btnCreateLibrary" type="button" value="Create library" /><br />
        <input type="button" id="btnUploadDocument" value="Upload document to library" />
        <input type="file" id="btnUploadFile" />

        <input id="btnCheckUserPermissions" type="button" value="Check User Permissions" /><br />
        <input id="btnUserProfileProperties" type="button" value="User profile properties" /><br />
        <br />

        Go to: <a href="../Lists/AGTasks" target="_blank">AG-Tasks list</a>&nbsp;|&nbsp;<a href="../Lists/Products" target="_blank">Products list</a>&nbsp;|&nbsp;<a href="../Lists/Categories" target="_blank">Categories list</a>
    </div>

</asp:Content>
