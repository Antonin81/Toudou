var coucou="Yo tout le monde je suis là si vous m'entendez répétez ce que j'vous dis";

class CategoriesTree{
    constructor(id, name, parentId){
        this.id=id;
        this.name=name;
        this.parentId=parentId;
        this.children=[];
    }
    // fonction booléenne qui doit renvoyer si une catégorie se trouve dans l'arbre, à partir de son id
    containsId(id){
        if(this.id==id){
            return true;
        }else{
            for(let cat of this.children){
                if(cat.containsId(id)){
                    return true;
                }
            }
            return false;
        }
    }
    //Fonction qui trouve ma catégorie correspondant à un id donné dans l'arbre
    getCategory(id){
        try {
            //teste si on a trouvé le noeud possédant le bon identifiant, si oui on le renvoit, sinon autre traitement
            if(this.id==id){
                return this;
            }else{
                //ici, pour chaque enfant du noeud actuel, on teste la correspondance
                let solution;
                for(let cat of this.children){
                    solution = cat.getCategory(id);
                    //si la solution est définie, on la renvoit.
                    if(solution!=undefined){
                        return solution;
                    }
                }
                //on retourne la solution trouvée
                return solution;
            }
        } catch (error) {
            console.error("This Category isn't stored");
        }
    }
    //on récupère le parent d'une catégorie à partir de son id
    getParentId(id){
        if(this.containsId(id)){
            return ((this.getCategory(id)).parentId);
        }else{
            console.error("This element isn't in the tree");
        }
    }
    //fonction qui ajoute un noeud à l'arbre
    add(category){
        this.getCategory(category.parent_category).children.push(new CategoriesTree(category.id_category,category.name,category.parent_category))
    }

    //fonction de conversion d'un arbre vers un string
    toString(){
        return `\n\nid : ${this.id}, name : ${this.name}, parentCategory : ${this.parentId}, children : ${this.children}, associated tasks : ${tasksMap.get(this.id)}`;
    }

    //fonction de creation d'html à partir d'un arbre
    createHtml(htmlComponent,level){
        if(level==0){
            htmlComponent.append($(`<div id="category${this.id}" style="--data-level:${level}" class="mainList__row categoryRow"><p>${this.name}</p></div>`));
        }else{
            htmlComponent.append($(`<div id="category${this.id}" style="--data-level:${level}" class="mainList__row categoryRow"><p>${this.name}</p><button onclick="supCategory(this)">Supprimer</button></div>`));
        }
        
        if(tasksMap.has(this.id)){
            taskListToHtml(tasksMap.get(this.id),htmlComponent,level+1);
        }
        for(let child of this.children){
            child.createHtml(htmlComponent,level+1);
        }
    }

}