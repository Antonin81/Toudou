var socket=io();

//The CategoriesTree class is imported from categoryTree.js

var openedTasks=new Set();
var tasksMap;
var categoriesTree;

// ----- functions -----

//Translate a list of task into html component
function taskListToHtml(tasksList,htmlComponent,level){
    for (let element of tasksList){
        htmlComponent.append(taskToHtml(element,level));
    }
}

//Translate a task into html component
function taskToHtml(task,level){

    let container=$(`<div id="task${task.id_task}" style="--data-level:${level}" class="mainList__row taskRow"></div>`);
    let mainPart=$(`<div class="flex mainList__row__mainPart"></div>`);
    let secondDivision=$("<div></div>");
    let complementaryPart=$(`<div class="mainList__row__complementaryPart"></div>`);
    
    let taskTitle=`<p>${task.title}</p>`;
    let taskDescription=(`<h3>Description : </h3><p>${task.description}</p>`).replace(/\n/g,"<br>");
    let taskEndDate=$(`<h3>Date limite : </h3><p>${utcToLocal(task.end_date)}</p>`);
    let [days,hours,minutes]=calculateDuration(task.duration);
    let taskDuration;
    let taskCompletionDate=$(`<h3>Instant de completion : </h3><p>${utcToLocalDateAndHours(task.completionDate)}</p>`);

    if(days==0 && hours==0 && minutes==0){
        taskDuration=$(`<h3>Durée estimée : </h3><p> Durée non renseignée</p>`);
    }else{
        taskDuration=$(`<h3>Durée estimée : </h3><p>${days}j ${hours}h ${minutes}m</p>`);
    }

    secondDivision.append(`<button data-taskId="${task.id_task}" onclick='openTaskDetails(this)'>Ouvrir</button>`,"<button onclick='sup(this)'>Supprimer</button>");
    mainPart.append(taskTitle, secondDivision);
    complementaryPart.append(taskDescription,taskEndDate,taskDuration,taskCompletionDate);
    container.append(mainPart,complementaryPart);
    return container;
}

//Open the task's description
function openTaskDetails(element){
    let idElement=element.getAttribute("data-taskId");
    if(openedTasks.has(idElement)){
        openedTasks.delete(idElement);
        $(`#task${idElement}`).children(`.mainList__row__complementaryPart`).css("display","none");
    }else{
        openedTasks.add(idElement);
        $(`#task${idElement}`).children(`.mainList__row__complementaryPart`).css("display","block");
    }
}

//Convert UTC hour to local
function utcToLocal(date){
    if (date!=null){
        let utcDate=new Date(Date.parse(date));
        const localDate = new Date();
        localDate.setUTCFullYear(utcDate.getUTCFullYear());
        localDate.setUTCMonth(utcDate.getUTCMonth());
        localDate.setUTCDate(utcDate.getUTCDate());
        localDate.setUTCHours(utcDate.getUTCHours());
        const day = ('0' + localDate.getDate()).slice(-2);
        const month = ('0' + (localDate.getMonth() + 1)).slice(-2);
        const year = localDate.getFullYear();
        return `${day}/${month}/${year}`;
    }else{
        return "non renseigné";
    }
    
}

//Convert UTC hour to local with the time
function utcToLocalDateAndHours(date){
    if (date!=null){
        let utcDate=new Date(Date.parse(date));
        const localDate = new Date();
        localDate.setUTCFullYear(utcDate.getUTCFullYear());
        localDate.setUTCMonth(utcDate.getUTCMonth());
        localDate.setUTCDate(utcDate.getUTCDate());
        localDate.setUTCHours(utcDate.getUTCHours());
        localDate.setUTCMinutes(utcDate.getUTCMinutes());
        const day = ('0' + localDate.getDate()).slice(-2);
        const month = ('0' + (localDate.getMonth() + 1)).slice(-2);
        const year = localDate.getFullYear();
        const hours = ('0' + localDate.getHours()).slice(-2);
        const minutes = ('0' + localDate.getMinutes()).slice(-2);
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }else{
        return "non renseigné";
    }
    
}

//Convert duration time from minutes to days/hours/minutes
function calculateDuration(duration){
    let days=Math.floor(duration/(60*24));
    duration-=(60*24*days);
    let hours=Math.floor(duration/(60));
    duration-=60*hours;
    return [days,hours,duration];
    
}

//Opens a pop up which asks you a confirmation to delete a category
function supCategory(e){
    categoryTargeted=e.parentNode.id;
    $(`#notificationCategoryDeletion`).css("display","flex");
}

//Deletes the catgory
function definitiveSupCategory(){
    closeNotification();
    socket.emit("supCategory",categoryTargeted.split("category")[1]);
    update();
}

//Closes the confimation pop-up
function closeNotification(){
    $(`#notificationCategoryDeletion`).css("display","none");
}

//shows the tasks
function show(){
    categoriesTree.createHtml($("#list"),0);
}

function update(){
    $('#list').empty();
    socket.emit("débutCompleted","yo");
}

//Deletes the task
function sup(e){
    socket.emit("supTask",e.parentNode.parentNode.parentNode.id.split("task")[1]);
    $(`#${e.parentNode.parentNode.parentNode.id}`).remove();
}

//socket reception

socket.on("initCompleted",(msg)=>{
    let list= msg.tasksList;
    tasksMap=new Map();
    for (let task of list){
        if(tasksMap.has(task.task_category)){
            tasksMap.get(task.task_category).push(task);
        }else{
            tasksMap.set(task.task_category, [task]);
        }
    }
});

socket.on("initialisationCategoriesCompleted",(msg)=>{
    let list=msg.categoriesList;
    categoriesTree= new CategoriesTree(list[0].id_category,list[0].name,list[0].parent_category);
    list.shift();
    for( let cat of list){
        categoriesTree.add(cat);
    }
    show();
});

$(document).ready(function() { 
    socket.emit("débutCompleted","yo");
});