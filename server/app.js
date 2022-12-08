const express = require('express')
const app = express();
const fs = require('fs/promises');

const PORT = 5000;

app
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Methods", "*");

        next();
    });

app.get('/tasks', async(req, res) => {
    try {
        const tasks = await fs.readFile('./tasks.json');
        res.send(JSON.parse(tasks))
    }
    catch (error) {
        console.log(error.stack);
        res.status(500).send({ error: error.stack });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const task = req.body;
        const listBuffer = await fs.readFile('./tasks.json');
        const currentTasks = JSON.parse(listBuffer);
        var maxTaskID = 0;
        
        if (currentTasks && currentTasks.length > 0) {
            maxTaskID = currentTasks.reduce((maxID, currentElement) => currentElement.id > maxID ? currentElement.id : maxID, maxTaskID);
        }

        const newTask = {id: maxTaskID + 1, ...task};
        const newList = currentTasks ? [...currentTasks, newTask] : [newTask];
        
        await fs.writeFile('./tasks.json', JSON.stringify(newList));
        res.send(newTask);
    }
    catch (error) {
        res.status(500).send({ error: error.stack });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        var listBuffer = [];
        listBuffer = await fs.readFile('./tasks.json');
        const currentTasks = JSON.parse(listBuffer);

        if (currentTasks.length > 0){
            await fs.writeFile('./tasks.json', JSON.stringify(currentTasks.filter(task => task.id != id)));
            res.send({message: `Uppgift med id ${id} togs bort`});
        }
        else {
            res.status(404).send({ error: 'Ingen uppgift att ta bort'});
        }
    }
    catch (error) {
        res.status(500).send({ error: error.stack });
    }
    
});

app.put('/tasks', async (req, res) => {
    //const task = req.body;
    const task = req.body;
    var targetTask = {};
    targetTask = {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed
    };
    //console.log(targetTask);
    //var listBuffer;
    try{
        var listBuffer = [];
        listBuffer = await fs.readFile('./tasks.json');
        //console.log(listBuffer);
        const currentTasks = JSON.parse(listBuffer);
        const filteredTasks = currentTasks.filter(task => task.id != targetTask.id);
        const newList = [...filteredTasks, targetTask]
        await fs.writeFile('./tasks.json', JSON.stringify(newList));

        /* var targetTask = targetTask.filter((targetTask, index, self) =>
        index === self.findIndex((t) => (t.save === targetTask.save && t.State === targetTask.State))); */

        //console.log(targetTask);
        res.send(targetTask);
    }
    catch (err){
        console.log(err.stack);
    }
    
    /* try{
        
    }
    catch (err){
        console.log(err);
    }
    
    
    try{
        
    }
    catch (err){
        console.log(err);
    } */
    
    
    /*  */
});

app.listen(PORT, console.log('Server running on http://localhost:5000'));