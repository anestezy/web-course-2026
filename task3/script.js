var tasks = [];
var currentFilter = "all";
var nextId = 1;

var addForm = document.getElementById("add-form");
var taskInput = document.getElementById("task-input");
var warning = document.getElementById("warning");
var taskList = document.getElementById("task-list");
var counter = document.getElementById("counter");
var filterButtons = document.querySelectorAll(".filter-btn");

function addTask(text) {
  tasks.push({
    id: nextId,
    text: text,
    completed: false,
  });

  nextId = nextId + 1;
}

function isTaskVisible(task) {
  if (currentFilter === "all") {
    return true;
  }

  if (currentFilter === "active") {
    return !task.completed;
  }

  if (currentFilter === "completed") {
    return task.completed;
  }

  return true;
}

function createTaskItem(task) {
  var li = document.createElement("li");
  li.className = "task-item";

  if (task.completed) {
    li.classList.add("completed");
  }

  if (!isTaskVisible(task)) {
    li.style.display = "none";
  }

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "complete-check";
  checkbox.checked = task.completed;

  checkbox.addEventListener("change", function () {
    task.completed = checkbox.checked;
    render();
  });

  var span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;

  var deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Удалить";

  deleteButton.addEventListener("click", function () {
    tasks = tasks.filter(function (item) {
      return item.id !== task.id;
    });

    render();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteButton);

  return li;
}

function updateCounter() {
  var activeTasks = tasks.filter(function (task) {
    return !task.completed;
  });

  var completedTasks = tasks.filter(function (task) {
    return task.completed;
  });

  counter.textContent =
    "Осталось: " + activeTasks.length + ", выполнено: " + completedTasks.length;
}

function updateFilterButtons() {
  var i;

  for (i = 0; i < filterButtons.length; i = i + 1) {
    if (filterButtons[i].dataset.filter === currentFilter) {
      filterButtons[i].classList.add("active");
    } else {
      filterButtons[i].classList.remove("active");
    }
  }
}

function render() {
  taskList.innerHTML = "";

  var items = tasks.map(function (task) {
    return createTaskItem(task);
  });

  items.forEach(function (item) {
    taskList.appendChild(item);
  });

  updateCounter();
  updateFilterButtons();
}

addForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var text = taskInput.value.trim();

  if (text === "") {
    warning.classList.remove("hidden");
    return;
  }

  warning.classList.add("hidden");

  addTask(text);
  taskInput.value = "";

  render();
});

taskInput.addEventListener("input", function () {
  warning.classList.add("hidden");
});

var i;

for (i = 0; i < filterButtons.length; i = i + 1) {
  filterButtons[i].addEventListener("click", function () {
    currentFilter = this.dataset.filter;
    render();
  });
}

render();
