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
        const tasks = await fs.readFile('./tasks.json'); // Läser in data från JSON
        res.send(JSON.parse(tasks)); // Skickar data till API:t
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
            maxTaskID = currentTasks.reduce((maxID, currentElement) => currentElement.id > maxID ? currentElement.id : maxID, maxTaskID); // maxTaskID = högsta ID:t som finns i listan
        }

        const newTask = {id: maxTaskID + 1, ...task}; // Skapa en ny task med ett nytt id + det data som skickas till backend
        const newList = currentTasks ? [...currentTasks, newTask] : [newTask]; // Om currentTask finns, lägg till nya tasken till den befintliga listan, annars skapas en ny lista
        
        await fs.writeFile('./tasks.json', JSON.stringify(newList)); // Skriv listan med tasks till JSON-filen
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
        const currentTasks = JSON.parse(listBuffer); // Läs in existerande tasks

        if (currentTasks.length > 0){
            await fs.writeFile('./tasks.json', JSON.stringify(currentTasks.filter(task => task.id != id))); // Ta bort tasken med det angivna id:t och skriv den nya listan till JSON
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
    const task = req.body;
    var targetTask = {};

    // Skapa en 'ny' task med data som togs emot (updaterar bara 'completed')
    targetTask = {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed
    };

    try{
        var listBuffer = [];
        listBuffer = await fs.readFile('./tasks.json');
       
        const currentTasks = JSON.parse(listBuffer);
        const filteredTasks = currentTasks.filter(task => task.id != targetTask.id); // Ta bort den 'gamla' tasken
        const newList = [...filteredTasks, targetTask]; // Lägger till den 'nya' tasken
        await fs.writeFile('./tasks.json', JSON.stringify(newList)); // Skriv listan till JSON

        res.send(targetTask);
    }
    catch (err){
        console.log(err.stack);
    }
    
});

app.listen(PORT, console.log('Server running on http://localhost:5000')); // Startar servern