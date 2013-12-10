//Lists functions
function listInitialize()
{
    app.log("Lists.initialize");
    for (var i = 0; i < Globals.GLOB_LocalLists.length; i++) {
        getListFromServer(Globals.GLOB_LocalLists[i]);
    }
}


function getListItems(listName)
{

}

function getListFromServer(listName)
{
    app.log("List.from.server:" + listName);
}

function storeList(listName)
{
    app.log("List.store.local:" + listName);
}



