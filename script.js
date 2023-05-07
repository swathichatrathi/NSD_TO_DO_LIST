const taskList = document.getElementById("taskList");

// Connect to MongoDB
const mongoClient = new MongoClient("mongodb://localhost:27017/todo", { useNewUrlParser: true });
mongoClient.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MongoDB");
});

// Add task to database
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const task = taskInput.value;
  const collection = mongoClient.db("todo").collection("tasks");
  collection.insertOne({ task: task }, function(err, res) {
    if (err) throw err;
    console.log("Task added to database");
    taskInput.value = "";
    displayTasks();
  });
}

// Display tasks from database
function displayTasks() {
  const collection = mongoClient.db("todo").collection("tasks");
  collection.find({}).toArray(function(err, result) {
    if (err) throw err;
    taskList.innerHTML = "";
    for (let i = 0; i < result.length; i++) {
      const task = result[i].task;
      const li = document.createElement("li");
      li.innerText = task;
      li.setAttribute("data-id", result[i]._id);
      li.addEventListener("click", toggleCompleted);
      taskList.appendChild(li);
    }
  });
}

// Toggle completed status of task
function toggleCompleted(event) {
  const id = event.target.getAttribute("data-id");
  const collection = mongoClient.db("todo").collection("tasks");
  collection.findOne({ _id: ObjectId(id) }, function(err, result) {
    if (err) throw err;
    const task = result.task;
    const completed = result.completed ? false : true;
    collection.updateOne({ _id: ObjectId(id) }, { $set: { completed: completed } }, function(err, res) {
      if (err) throw err;
      console.log("Task status updated in database");
      displayTasks();
    });
  });
}

// Display tasks on page load
displayTasks();
