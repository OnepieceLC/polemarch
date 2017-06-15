 
var pmProjects = new pmItems()  

pmProjects.showList = function(holder, menuInfo, data)
{
    return $.when(pmProjects.loadItems()).done(function()
    {
        $(holder).html(spajs.just.render('projects_list', {}))
    }).fail(function()
    {
        $.notify("", "error");
    })
}

pmProjects.showItem = function(holder, menuInfo, data)
{
    console.log(menuInfo, data)
    
    return $.when(pmProjects.loadItem(data.reg[1])).done(function()
    {
        $(holder).html(spajs.just.render('project_page', {item_id:data.reg[1]}))
    }).fail(function()
    {
        $.notify("", "error");
    })
}

pmProjects.showNewItemPage = function(holder, menuInfo, data)
{ 
    $(holder).html(spajs.just.render('new_project_page', {}))
}

/**
 * Обновляет поле модел polemarch.model.userslist и ложит туда список пользователей 
 * Обновляет поле модел polemarch.model.users и ложит туда список инфу о пользователях по их id
 */
pmProjects.loadItems = function()
{
    return jQuery.ajax({
        url: "/api/v1/projects/",
        type: "GET",
        contentType:'application/json',
        data: "",
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        {
            console.log("update projects", data)
            polemarch.model.projectslist = data
            polemarch.model.projects = {}
            
            for(var i in data.results)
            {
                var val = data.results[i]
                polemarch.model.projects[val.id] = val
            }
        },
        error:function(e)
        {
            console.log(e)
            polemarch.showErrors(e)
        }
    });
}

/**
 * Обновляет поле модел polemarch.model.users[item_id] и ложит туда пользователя
 */
pmProjects.loadItem = function(item_id)
{
    return jQuery.ajax({
        url: "/api/v1/projects/"+item_id+"/",
        type: "GET",
        contentType:'application/json',
        data: "",
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        {
            console.log("load project", data)
            polemarch.model.projects[item_id] = data
        },
        error:function(e)
        {
            console.log(e)
            polemarch.showErrors(e)
        }
    });
}


/** 
 * @return $.Deferred
 */
pmProjects.addItem = function()
{ 
    var def = new $.Deferred();
    var data = {}

    data.name = $("#new_project_name").val()
    data.repository = $("#new_project_repository").val()
    data.vars = pmProjects.jsonEditorGetValues()
     
    if(!data.name)
    {
        $.notify("Invalid value in filed name", "error");
        def.reject()
        return def.promise();
    }
 
    $.ajax({
        url: "/api/v1/projects/",
        type: "POST",
        contentType:'application/json',
        data: JSON.stringify(data),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        { 
            $.notify("project created", "success");
            $.when(spajs.open({ menuId:"project/"+data.id})).always(function(){
                def.resolve()
            })
        },
        error:function(e)
        {
            def.reject()
            polemarch.showErrors(e.responseJSON)
        }
    }); 
    
    return def.promise();
}

/** 
 * @return $.Deferred
 */
pmProjects.updateItem = function(item_id)
{
    var data = {}

    data.name = $("#project_"+item_id+"_name").val()
    data.vars = pmProjects.jsonEditorGetValues()
    
    if(!data.name)
    {
        console.warn("Invalid value in filed name")
        $.notify("Invalid value in filed name", "error");
        return;
    }
 
    return $.ajax({
        url: "/api/v1/projects/"+item_id+"/",
        type: "PATCH",
        contentType:'application/json',
        data:JSON.stringify(data),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        { 
            $.notify("Save", "success");
        },
        error:function(e)
        {
            console.log("project "+item_id+" update error - " + JSON.stringify(e)); 
            polemarch.showErrors(e.responseJSON)
        }
    });
}

/** 
 * @return $.Deferred
 */
pmProjects.deleteItem = function(item_id, force)
{
    var def = new $.Deferred();
    if(!force && !confirm("Are you sure?"))
    {
        def.reject()
        return def.promise();
    }

    $.ajax({
        url: "/api/v1/projects/"+item_id+"/",
        type: "DELETE",
        contentType:'application/json',
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        { 
            $.when(spajs.open({ menuId:"projects"})).always(function(){
                def.resolve()
            })
        },
        error:function(e)
        {
            def.reject()
            polemarch.showErrors(e.responseJSON)
        }
    });
    
    return def.promise();
}

/**
 * Показывает форму со списком всех групп.
 * @return $.Deferred
 */
pmProjects.showAddSubInventoriesForm = function(item_id, holder)
{
    return $.when(pmInventories.loadItems()).done(function(){
        $("#add_existing_item_to_project").remove()
        $(".content").append(spajs.just.render('add_existing_inventories_to_project', {item_id:item_id}))
        $("#polemarch-model-items-select").select2();
    }).fail(function(){

    }).promise()
}

/**
 * Показывает форму со списком всех групп.
 * @return $.Deferred
 */
pmProjects.showAddSubInventoriesForm = function(item_id, holder)
{
    return $.when(pmInventories.loadItems()).done(function(){
        $("#add_existing_item_to_project").remove()
        $(".content").append(spajs.just.render('add_existing_inventories_to_project', {item_id:item_id}))
        $("#polemarch-model-items-select").select2();
    }).fail(function(){

    }).promise()
}

/**
 * Показывает форму со списком всех групп.
 * @return $.Deferred
 */
pmProjects.showAddSubGroupsForm = function(item_id, holder)
{
    return $.when(pmGroups.loadItems()).done(function(){
        $("#add_existing_item_to_project").remove()
        $(".content").append(spajs.just.render('add_existing_groups_to_project', {item_id:item_id}))
        $("#polemarch-model-items-select").select2();
    }).fail(function(){

    }).promise()
}

/**
 * Показывает форму со списком всех хостов.
 * @return $.Deferred
 */
pmProjects.showAddSubHostsForm = function(item_id, holder)
{
    return $.when(pmHosts.loadItems()).done(function(){
        $("#add_existing_item_to_project").remove()
        $(".content").append(spajs.just.render('add_existing_hosts_to_project', {item_id:item_id}))
        $("#polemarch-model-items-select").select2();
    }).fail(function(){

    }).promise()
}

/**
 * Проверяет принадлежит ли host_id к группе item_id
 * @param {Integer} item_id
 * @param {Integer} host_id
 * @returns {Boolean}
 */
pmProjects.hasHosts = function(item_id, host_id)
{
    if(polemarch.model.projects[item_id])
    {
        for(var i in polemarch.model.projects[item_id].hosts)
        {
            if(polemarch.model.projects[item_id].hosts[i].id == host_id)
            {
                return true;
            }
        }
    }
    return false;
}

/**
 * Проверяет принадлежит ли host_id к группе item_id
 * @param {Integer} item_id
 * @param {Integer} host_id
 * @returns {Boolean}
 */
pmProjects.hasGroups = function(item_id, group_id)
{
    if(polemarch.model.projects[item_id])
    {
        for(var i in polemarch.model.projects[item_id].groups)
        {
            if(polemarch.model.projects[item_id].groups[i].id == group_id)
            {
                return true;
            }
        }
    }
    return false;
}

/**
 * Проверяет принадлежит ли Inventory_id к группе item_id
 * @param {Integer} item_id
 * @param {Integer} inventory_id
 * @returns {Boolean}
 */
pmProjects.hasInventories = function(item_id, inventory_id)
{
    if(polemarch.model.projects[item_id])
    {
        for(var i in polemarch.model.projects[item_id].inventories)
        {
            if(polemarch.model.projects[item_id].inventories[i].id == inventory_id)
            {
                return true;
            }
        }
    }
    return false;
}

 
/**
 * @return $.Deferred
 */
pmProjects.setSubInventories = function(item_id, inventories_ids)
{
    return $.ajax({
        url: "/api/v1/projects/"+item_id+"/inventories/",
        type: "POST",
        contentType:'application/json',
        data:JSON.stringify(inventories_ids),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        { 
            if(polemarch.model.projects[item_id])
            {
                polemarch.model.projects[item_id].inventories = []
                for(var i in inventories_ids)
                {
                    polemarch.model.projects[item_id].inventories.push(polemarch.model.inventories[inventories_ids[i]])
                }
            }
            console.log("inventories update", data);
            $.notify("Save", "success");
        },
        error:function(e)
        {
            console.log("inventories "+item_id+" update error - " + JSON.stringify(e));
            polemarch.showErrors(e.responseJSON)
        }
    });
}
 
/**
 * @return $.Deferred
 */
pmProjects.setSubGroups = function(item_id, groups_ids)
{
    return $.ajax({
        url: "/api/v1/projects/"+item_id+"/groups/",
        type: "POST",
        contentType:'application/json',
        data:JSON.stringify(groups_ids),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        { 
            if(polemarch.model.projects[item_id])
            {
                polemarch.model.projects[item_id].groups = []
                for(var i in groups_ids)
                {
                    polemarch.model.projects[item_id].groups.push(polemarch.model.groups[groups_ids[i]])
                }
            }
            console.log("group update", data);
            $.notify("Save", "success");
        },
        error:function(e)
        {
            console.log("group "+item_id+" update error - " + JSON.stringify(e));
            polemarch.showErrors(e.responseJSON)
        }
    });
}

/**
 * @return $.Deferred
 */
pmProjects.setSubHosts = function(item_id, hosts_ids)
{
    return $.ajax({
        url: "/api/v1/projects/"+item_id+"/hosts/",
        type: "POST",
        contentType:'application/json',
        data:JSON.stringify(hosts_ids),
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function(data)
        {
            if(polemarch.model.projects[item_id])
            {
                polemarch.model.projects[item_id].hosts = []
                for(var i in hosts_ids)
                {
                    polemarch.model.projects[item_id].hosts.push(polemarch.model.hosts[hosts_ids[i]])
                }
            } 
            $.notify("Save", "success");
        },
        error:function(e) 
        {
            console.log("project "+item_id+" update error - " + JSON.stringify(e));
            polemarch.showErrors(e.responseJSON)
        }
    });
}

pmProjects.search = function(query)
{
    console.log("search", query) 
    if(!query)
    {
        $(".projects-list .project-row").show();
        return;
    }
    
    for(var i in polemarch.model.projectslist.results)
    {
        var val = polemarch.model.projectslist.results[i]
        
        var position = val.name.indexOf(query);
        var el = $(".projects-list .project-"+val.id)
        if( position == -1)
        {
            position = 999;
            el.hide();
        }
        else
        {
            el.show();
        }
        
        $(".projects-list .project-"+val.id).attr({ 'data-position':position });
    }
    
    var sortItems = $(".projects-list").children();
    sortItems.sort(fSort);
    
    sortItems.detach().appendTo($(".projects-list"));
}

function fSort(a, b)
{
    a = parseInt($(a).attr("data-position"));
    if(isNaN(a))
    {
        return 1;
    }

    b = parseInt($(b).attr("data-position"));
    if(isNaN(b))
    {
        return -1;
    }

    return a-b;
}