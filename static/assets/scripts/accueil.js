var socket=io();

//The CategoriesTree class is imported from categoryTree.js

var openedTasks=new Set();
var tasksMap;
var categoriesTree;
var categoriesListForSelect;
var categoryTargeted=null;

function supCategory(e){
    categoryTargeted=e.parentNode.id;
    $(`#notificationCategoryDeletion`).css("display","flex");
}

function definitiveSupCategory(){
    closeNotification();
    socket.emit("supCategory",categoryTargeted.split("category")[1]);
    update();
}

function closeNotification(){
    $(`#notificationCategoryDeletion`).css("display","none");
}

function taskListToHtml(tasksList,htmlComponent,level){
    for (let element of tasksList){
        htmlComponent.append(taskToHtml(element,level));
    }
}

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
    let moveProposition=$(`<div class="flex"></div>`);
    let labelMoveProposition=$(`<h3>Déplacer vers : </h3>`);
    let buttonMoveProposition=$(`<button onclick="moveTask(${task.id_task})">Valider</button>`);
    let selectMoveProposition=$(`<select class="finalCategory" name="finalCategory"></select>`);
    for(let cat of categoriesListForSelect){
        selectMoveProposition.append(`<option value=${cat.id_category}>${cat.name}</option>`);
    }
    moveProposition.append(labelMoveProposition,selectMoveProposition);

    if(days==0 && hours==0 && minutes==0){
        taskDuration=$(`<h3>Durée estimée : </h3><p> Durée non renseignée</p>`);
    }else{
        taskDuration=$(`<h3>Durée estimée : </h3><p>${days}j ${hours}h ${minutes}m</p>`);
    }

    secondDivision.append(`<button data-taskId="${task.id_task}" onclick='openTaskDetails(this)'>Ouvrir</button>`,"<button onclick='sup(this)'>Supprimer</button>","<button onclick='check(this)'>Check</button>");
    mainPart.append(taskTitle, secondDivision);
    complementaryPart.append(taskDescription,taskEndDate,taskDuration,moveProposition,buttonMoveProposition);
    container.append(mainPart,complementaryPart);
    console.log("hello?")
    return container;
}

socket.on("initialisationHome",(msg)=>{
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
socket.on("initialisationCategoriesHome",(msg)=>{
    let list=msg.categoriesList;
    categoriesTree= new CategoriesTree(list[0].id_category,list[0].name,list[0].parent_category);
    categoriesListForSelect=[];
    categoriesListForSelect.push(list[0]);
    list.shift();
    
    for( let cat of list){
        categoriesListForSelect.push(cat);
        categoriesTree.add(cat);
    }
    show();
});

function moveTask(taskId){
    socket.emit("moveTask",({taskId:taskId, newCategory:$(`#task${taskId}`).find(".finalCategory").val()}))
    socket.emit("début","");
}

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
        return "non renseignée";
    }
    
}

function calculateDuration(duration){
    let days=Math.floor(duration/(60*24));
    duration-=(60*24*days);
    let hours=Math.floor(duration/(60));
    duration-=60*hours;
    return [days,hours,duration];
    
}

function show(){
    $("#list").empty();
    categoriesTree.createHtml($("#list"),0);
}


function update(){
    $('#list').empty();
    socket.emit("début","");
}

function getTodayDate(){
    let now = new Date();
    let nowString=now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    return nowString;
}

function sup(e){
    socket.emit("supTask",e.parentNode.parentNode.parentNode.id.split("task")[1]);
    $(`#${e.parentNode.parentNode.parentNode.id}`).remove();
}

function check(e){
    socket.emit("checkTask",[getTodayDate(),e.parentNode.parentNode.parentNode.id.split("task")[1]]);
    $(`#${e.parentNode.parentNode.parentNode.id}`).remove();
}

$(document).ready(function() { 
    socket.emit("début","");
    console.log(coucou);
});