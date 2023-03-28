var socket=io();

let categoriesMap;

function validCategoryChange(){
    let newName=$(`#changeNameCategoryInput`).val().replace(/'/g, "\\'");
    let exCategory=$(`#categoryNameToChangeInput`).val().split("option")[1];
    socket.emit("changeCategoryName",{ex:exCategory, new:newName});
    socket.emit("askForCategories","");
    $("#categoryNameModificationNotification").attr("data-active",true);
    setTimeout(()=>{$("#categoryNameModificationNotification").attr("data-active",false);},5000);
    console.log(newName)
    console.log(exCategory)
}

function emptySelect(){
    $("#parentCategoryInput").empty();
    $("#parentTaskInput").empty();
    $("#categoryNameToChangeInput").empty();
}

function validCategory(){
    if($("#nameCategoryInput").val()!=""){
        socket.emit("createCategory",[($("#nameCategoryInput").val()).replace(/'/g, "\\'"),($("#parentCategoryInput").val().split("option")[1])]);
        socket.emit("askForCategories","please");
        $("#validationNotificationTask").attr("data-active",true);
        setTimeout(()=>{$("#validationNotificationTask").attr("data-active",false);},5000);
        $("#nameCategoryInput").val("");
    }else{
        $("#rejectionNotification").attr("data-active",true);
        setTimeout(()=>{$("#rejectionNotification").attr("data-active",false);},5000);
    }
    
}


function pathBuilder(cat){
    if(cat.id_category==cat.parent_category){
        return cat.name
    }else{
        return pathBuilder(categoriesMap.get(cat.parent_category))+"/"+cat.name;
    }
}

function fillSelectsCategories(listeCategories){
    for (category of listeCategories){
        let option1=$(`<option value=option${category.id_category}>${pathBuilder(category)}</option>`);
        let option2=$(`<option value=option${category.id_category}>${pathBuilder(category)}</option>`);
        let option3=$(`<option value=option${category.id_category}>${pathBuilder(category)}</option>`);
        $("#parentCategoryInput").append(option1);
        $("#parentTaskInput").append(option2);
        $("#categoryNameToChangeInput").append(option3);
    }
}

socket.on("sendCategories",(msg)=>{
    let list=msg.listeCategories;
    categoriesMap=new Map();
    for( let cat of list){
        categoriesMap.set(cat.id_category,cat);
    }
    emptySelect();
    fillSelectsCategories(list);
});


function valid(){
    console.log($("#titleInput").val()!="")
    if($("#titleInput").val()!=""){
        let date=$("#end_dateInput").val();
        let dateFin;
        if (date==''){
            dateFin=null;
        }else{
            dateFin=$("#end_dateInput").val();
        }
        let durationInMinutes=0;
        console.log($("#daysInput").val())
        if($("#daysInput").val()!=""){
            durationInMinutes+=parseInt($("#daysInput").val())*24*60;
        }
        if($("#hoursInput").val()!=""){
            durationInMinutes+=parseInt($("#hoursInput").val())*60;
        }
        if($("#minutesInput").val()!=""){
            durationInMinutes+=parseInt($("#minutesInput").val());
        }
        if (durationInMinutes==0){
            durationInMinutes=null;
        }
        socket.emit("addTask",{title:($("#titleInput").val()).replace(/'/g, "\\'"),description:($("#descriptionInput").val()).replace(/'/g, "\\'"),end_date:dateFin,duration:durationInMinutes,parentTask:($("#parentTaskInput").val().split("option")[1])});
        $("#validationNotificationTask").attr("data-active",true);
        setTimeout(()=>{$("#validationNotificationTask").attr("data-active",false);},5000);
        $("#titleInput").val("");
        $("#descriptionInput").val("");
        $("#daysInput").val("");
        $("#hoursInput").val("");
        $("#minutesInput").val("");
        $("#end_dateInput").val("");
    }else{
        $("#rejectionNotification").attr("data-active",true);
        setTimeout(()=>{$("#rejectionNotification").attr("data-active",false);},5000);
    }
}

$(document).ready(function() { 
    socket.emit("askForCategories","");
});