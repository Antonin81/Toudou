const express=require('express');
const app=express();
const http = require('http').createServer(app);
const mysql=require('mysql');
const opn=require('opn');
const io = require('socket.io')(http);

app.use(express.static('static'));

// ouvre le port et le serveur

http.listen(3001, () =>{
    console.log("Je suis sur le port 3001");
    opn("http://localhost:3001");
});

//crée la connexion avec la bdd

const db=mysql.createConnection({
    host:"localhost",

    user:"root",

    password:"root",

    database:"toudou"
});

//gère le cas où la connexion échoue

db.connect(function(err){
    if (err) throw err;
    console.log("Connecté à la base de données");
});

//routage

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/static/pages/accueil.html');
});
app.get('/addTasks', (req,res) => {
    res.sendFile(__dirname + '/static/pages/addTasks.html');
});
app.get('/completedTasks', (req,res) => {
    res.sendFile(__dirname + '/static/pages/completedTasks.html');
});

//Gestion de la communication client/serveur

io.on('connection', (socket) => {

    console.log("voilà un connecté");

    //fonctions liées à l'accueil

    socket.on("début",(msg)=>{
        db.query("select * from tasks where is_done=false;", function(err, reponse){
            if (err) throw err;
            var locals={
                tasksList:reponse
            }
            io.to(socket.id).emit('initialisationHome',locals);
        });
        db.query("select * from categories order by parent_category asc, id_category asc;", function(err, reponse){
            if (err) throw err;
            var locals={
                categoriesList:reponse
            }
            io.to(socket.id).emit('initialisationCategoriesHome',locals);
        });
        console.log("connecté à l'accueil")
    });

    socket.on("checkTask",(msg)=>{
        console.log(msg);
        db.query("update tasks set is_done=true where id_task="+msg[1]+";", function(err, reponse){
            if (err) throw err;
        });
        db.query("update tasks set completionDate='"+msg[0]+"' where id_task="+msg[1]+";", function(err,reponse){
            if(err) throw err;
        });
    });
    socket.on("moveTask",(msg)=>{
        console.log(msg)
        db.query("update tasks set task_category="+msg.newCategory+" where id_task="+msg.taskId+";", function(err,reponse){
            if(err) throw err;
        });
    });

    //fonctions liées à la page des tâches remplies

    socket.on("débutCompleted",(msg1)=>{
        db.query("select * from tasks where is_done=true;", function(err, reponse){
            if (err) throw err;
            var locals={
                tasksList:reponse
            }
            io.to(socket.id).emit('initCompleted',locals);
        });
        db.query("select * from categories order by parent_category asc, id_category asc;", function(err, reponse){
            if (err) throw err;
            var locals={
                categoriesList:reponse
            }
            io.to(socket.id).emit('initialisationCategoriesCompleted',locals);
        });
        console.log("connecté aux finies")
    });

    

    //fonctions liées à la page d'ajouts

    socket.on("addTask",(msg)=>{
        if(msg.end_date!=null){
            db.query("insert into tasks (title, description, end_date,is_done,duration,task_category) values ('"+msg.title+"', '"+msg.description+"','"+msg.end_date+"',false,"+msg.duration+","+msg.parentTask+");", function(err, reponse){
                if (err) throw err;
            });
        }else{
            db.query("insert into tasks (title, description,is_done,duration,task_category) values ('"+msg.title+"', '"+msg.description+"',false,"+msg.duration+","+msg.parentTask+");", function(err, reponse){
                if (err) throw err;
            });
        }
    });

    socket.on("askForCategories",(msg)=>{
        db.query("select * from categories order by parent_category asc, id_category asc;", function(err,reponse){
            if(err) throw err;
            var locals={
                listeCategories:reponse
            }
            io.to(socket.id).emit('sendCategories',locals);
        });
    });

    socket.on("createCategory",(msg)=>{
        db.query("insert into categories(name, parent_category) values('"+msg[0]+"',"+msg[1]+");", function(err, reponse){
            if(err)throw err;
        });
    });

    socket.on("changeCategoryName",(msg)=>{
        db.query(`update categories set name='${msg.new}' where id_category=${msg.ex};`, function(err, reponse){
            if(err) throw err;
        });
    });

    //fonctions liées à l'accueil et à la page des remplies

    socket.on("supTask",(msg)=>{
        db.query("delete from tasks where id_task="+msg+";", function(err, reponse){
            if (err) throw err;
        });
    });

    socket.on("supCategory", (msg)=>{
        db.query("delete from tasks where task_category="+msg+";", function(err, reponse){
            if (err) throw err;
        });
        db.query("delete from categories where id_category="+msg+";", function(err, reponse){
            if (err) throw err;
        });
    });

});