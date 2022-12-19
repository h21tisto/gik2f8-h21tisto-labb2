let titleValid = false;
let dueDateValid = false;
let descriptionValid = true;

const title = todoForm.title;
const dueDate = todoForm.dueDate;
const description = todoForm.description
const api = new Api("http://localhost:5000/tasks");
const todoListElement = document.getElementById('todoList');
const completedTasksElement = document.getElementById('completedTasks');

todoForm.addEventListener('submit', onSubmit);
title.addEventListener('blur', (e) => validateField(e.target));
title.addEventListener('input', (e) => validateField(e.target));
dueDate.addEventListener('blur', (e) => validateField(e.target));
dueDate.addEventListener('input', (e) => validateField(e.target));
description.addEventListener('blur', (e) => validateField(e.target));
description.addEventListener('input', (e) => validateField(e.target));


async function checkBox(event) {
    var description;
    const task = event.parentElement;
    const title = task.children[1].innerText;
    const id = parseInt(task.parentElement.id);
    const dueDate = task.children[2].children[0].innerText;
    
    try { description = task.parentElement.children[1].innerText; } catch{ description = '' }; // Om det finns ett description-element, spara den existerande texten till en variabel

    // Skapa ett nytt task-objekt med ett uppdaterat 'completed'-fält 
    let taskData = {
        id: id,
        title: title,
        description: '',
        dueDate: dueDate,
        completed: event.checked
    };
 
    if (description !== '') taskData.description = description; // Om en description existerar, sätt description:en till den existerande texten
    
    api.update(taskData).then(() => renderList());
}


function validateField(field) {
    const {name, value} = field;
    let validationMessage = '';

    switch(name){
        case 'title':{
            if (value.length < 2){
                titleValid = false;
                validationMessage = "Fältet 'Titel' måste innehålla minst 2 tecken!";
            }
            else if (value.length > 100){
                titleValid = false;
                validationMessage = "Fältet 'Titel' får inte innehålla mer än 100 tecken!";
            }
            else {
                titleValid = true;
            }
            break;
        }
        case 'description':{
            if (value.length > 500){
                descriptionValid = false;
                validationMessage = "Fältet 'Beskrivning' får inte innehålla mer än 500 tecken!";
            }
            else {
                descriptionValid = true;
            }
            break;
        }
        case 'dueDate': {
            if (value.length === 0){
                dueDateValid = false;
                validationMessage = "Fältet 'Slutfört senast' är obligatoriskt!";
            }
            else {
                dueDateValid = true;
            }
            break;
        }
    }

    const errorMessage = field.previousElementSibling.children[1];
    errorMessage.innerText = validationMessage;
    errorMessage.classList.remove('hidden');
}


function onSubmit(e) {
    e.preventDefault();
    let validationMessage = '';

    if (!titleValid){
        validationMessage = "Fältet 'Titel' är obligatoriskt!";
        document.getElementById('title').previousElementSibling.children[1].innerText = validationMessage;
        document.getElementById('title').previousElementSibling.children[1].classList.remove('hidden');
    }

    if (!dueDateValid){
        validationMessage = "Fältet 'Slutfört senast' är obligatoriskt!";
        document.getElementById('dueDate').previousElementSibling.children[1].innerText = validationMessage;
        document.getElementById('dueDate').previousElementSibling.children[1].classList.remove('hidden');
    }

    if (titleValid && descriptionValid && dueDateValid){
        saveTask();
    }
}


function saveTask() {
    const task = {
        title: todoForm.title.value,
        description: todoForm.description.value,
        dueDate: todoForm.dueDate.value,
        completed: false
    };
    
    api.create(task).then((task) => { if (task) renderList() });

    title.value = '';
    description.value = '';
    dueDate.value = '';

    titleValid = false;
    dueDateValid = false;
}


function renderList() {
    api.getAll().then(tasks => {
        todoListElement.innerHTML = '';
        completedTasksElement.innerHTML = '';

        if (tasks && tasks.length > 0){
            // Sorterar tasks baserat på dueDate
            tasks.sort(function(firstTask, secondTask)
                {return parseInt(firstTask.dueDate.replace(/\-/g, '')) -    // replace(/\-/g, '') tar bort alla '-' från strängen
                        parseInt(secondTask.dueDate.replace(/\-/g, ''))}); 


            // Lägg till tasken i rätt lista baserat på om den är completed eller inte
            tasks.forEach(task => {
                if (task.completed) completedTasksElement.insertAdjacentHTML('beforeend', renderTask(task, true)); 
                else todoListElement.insertAdjacentHTML('beforeend', renderTask(task, false));
            });
        }
    });
}


function renderTask({id, title, description, dueDate}, completed) {
    let html = ``;
    if (completed){
        html = `<li id="${id}" class="select-none mt-2 py-2 border-b border-blue-500">
                    <div class="flex items-center">
                        <input onclick="checkBox(this)" type="checkbox" id="checkbox" name="completed" checked class="checkbox mr-2 mb-2">
                        <h3 class="w-auto mb-3 flex-1 text-xl font-bold text-green-700 uppercase">${title}</h3>
                        <div class="pb-2">
                            <span>${dueDate}</span>
                            <button onclick="deleteTask(${id})" class="inline-block bg-blue-300 text-xs text-black border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
                        </div>
                    </div>`
    }
    else {
        html = `<li id="${id}" class="select-none mt-2 py-2 border-b border-blue-500">
                    <div class="flex items-center">
                        <input onclick="checkBox(this)" type="checkbox" id="checkbox" name="completed" class="checkbox mr-2 mb-2">
                        <h3 class="title mb-3 flex-1 text-xl font-bold text-red-700 uppercase">${title}</h3>
                        <div class="pb-2">
                            <span class="dueDate">${dueDate}</span>
                            <button onclick="deleteTask(${id})" class="inline-block bg-blue-300 text-xs text-black border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
                        </div>
                    </div>`

    }
    
    if (description){
        html += `<p class="description ml-6 mt-2 pb-4 text-xs italic">${description}</p>`;
    }

    html += `</li>`

    return html;
};

async function deleteTask(id) {
    api.remove(id).then(() => renderList());
}

renderList();