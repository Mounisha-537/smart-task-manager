const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("priority");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editIndex = null;

// Save
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Calculate duration
function calculateDuration(start, end) {
    if (!start || !end) return "N/A";
    const diff = new Date(end) - new Date(start);
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return "Invalid Date";
    return days + " day(s)";
}

// Render
function renderTasks() {
    taskList.innerHTML = "";

    let today = new Date().setHours(0,0,0,0);

    let filtered = tasks.filter((task) => {
        if (currentFilter === "completed" && !task.completed) return false;
        if (currentFilter === "pending" && task.completed) return false;
        if (!task.text.toLowerCase().includes(searchInput.value.toLowerCase())) return false;
        return true;
    });

    filtered.forEach((task, index) => {

        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        const duration = calculateDuration(task.startDate, task.endDate);

        // Check overdue
        let isOverdue = false;
        if (task.endDate && !task.completed) {
            let taskEnd = new Date(task.endDate).setHours(0,0,0,0);
            if (taskEnd < today) {
                isOverdue = true;
                li.classList.add("overdue");
            }
        }

        const leftDiv = document.createElement("div");

        leftDiv.innerHTML = `
            <strong>${task.text}</strong>
            ${isOverdue ? '<span class="badge">OVERDUE</span>' : ''}
            <br>
            <small>Priority: ${task.priority}</small><br>
            <small>Start: ${task.startDate || "N/A"}</small><br>
            <small>End: ${task.endDate || "N/A"}</small><br>
            <small>Duration: ${duration}</small>
        `;

        const rightDiv = document.createElement("div");

        // Complete
        const completeBtn = document.createElement("button");
        completeBtn.textContent = "✓";
        completeBtn.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };

        // Edit
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => {
            taskInput.value = task.text;
            prioritySelect.value = task.priority;
            startDateInput.value = task.startDate;
            endDateInput.value = task.endDate;

            editIndex = index;
            addTaskBtn.textContent = "Update Task";
        };

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.onclick = () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        };

        rightDiv.appendChild(completeBtn);
        rightDiv.appendChild(editBtn);
        rightDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(rightDiv);

        taskList.appendChild(li);
    });
}

// Add or Update Task
function addOrUpdateTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        text,
        priority: prioritySelect.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        completed: false
    };

    if (editIndex !== null) {
        tasks[editIndex] = { ...tasks[editIndex], ...newTask };
        editIndex = null;
        addTaskBtn.textContent = "Add";
    } else {
        tasks.push(newTask);
    }

    taskInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";

    saveTasks();
    renderTasks();
}

// Sort by End Date
sortBtn.onclick = () => {
    tasks.sort((a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
    });
    saveTasks();
    renderTasks();
};

// Search
searchInput.addEventListener("input", renderTasks);

// Filters
filterButtons.forEach(button => {
    button.onclick = () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        renderTasks();
    };
});

// Dark mode
darkModeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
};

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Events
addTaskBtn.onclick = addOrUpdateTask;

taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addOrUpdateTask();
});

renderTasks();