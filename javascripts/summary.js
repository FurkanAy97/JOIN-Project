// Check, wether the Flag-Variable already exists in sessionStorage
let isActive = sessionStorage.getItem("isActive");
// If not, set it to true
isActive = isActive === null ? true : JSON.parse(isActive);

/**
 * Calls all functions for summary card
 */
async function startSummary() {
  checkifLoggedIn()
  includeHTML("summaryMenu");
  getDataForSummary();
  taskWithEarliestDuedate();
  tasksAsJSON = await getRemoteData("tasksRemote");
  if (!isActive && window.innerWidth < 670) {
    return; 
  }
  greet(); 
  isActive = false;
  sessionStorage.setItem("isActive", JSON.stringify(isActive));
}

/**
 * Changes greeting according to the time of day
 */
async function greet() {
  const date = new Date();
  const hours = date.getHours();
  let timeOfDay;

  if (hours < 12) {
    timeOfDay = "Good morning,";
  } else if (hours < 17) {
    timeOfDay = "Good afternoon,";
  } else {
    timeOfDay = "Good evening,";
  }

  const element = document.getElementById("greeting");
  const property = window.getComputedStyle(element).getPropertyValue("display");

  const currentUserName = (await JSON.parse((await getItem("currentUserName")).data.value.replace(/'/g, '"'))).name;

  document.getElementById("greetingText").innerHTML = timeOfDay;
  document.getElementById("greetingName").innerHTML = currentUserName;

  document.getElementById("greetingText2").innerHTML = timeOfDay;
  document.getElementById("greetingName2").innerHTML = currentUserName;
}

/**
 * Sumes up tasks per category and urgency per priority
 */
async function getDataForSummary() {
  const res = await getItem("tasksRemote");
  const remoteTasksAsJSON = JSON.parse(res.data.value.replace(/'/g, '"'));

  document.getElementById("tasksInBoard").innerHTML = remoteTasksAsJSON.length;
  document.getElementById("tasksInProgress").innerHTML = getCountByStatus(remoteTasksAsJSON, "inProgress");
  document.getElementById("tasksAwaitingFeedback").innerHTML = getCountByStatus(remoteTasksAsJSON, "awaitingFeedback");
  document.getElementById("sumToDo").innerHTML = getCountByStatus(remoteTasksAsJSON, "todo");
  document.getElementById("sumDone").innerHTML = getCountByStatus(remoteTasksAsJSON, "done");
  document.getElementById("sumUrgent").innerHTML = getCountByPriority(remoteTasksAsJSON, "urgent");
}

function getCountByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}

function getCountByPriority(tasks, priority) {
  return tasks.filter((task) => task.priority === priority).length;
}

/**
 * Shows earliest due date of tasks with category='urgent'
 */
async function taskWithEarliestDuedate() {
  let res = await getItem("tasksRemote");
  remoteTasksAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));

  let earliestDate = ["2021-06-04"];
  for (let i = 0; i < remoteTasksAsJSON.length; i++) {
    if (remoteTasksAsJSON[i].priority == "urgent") {
      let currentDate = remoteTasksAsJSON[i].dueDate;
      if (currentDate > earliestDate) {
        earliestDate = currentDate;
      }
    }
    let d1 = new Date(earliestDate);
    let d2 = d1.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    document.getElementById("dateDeadline").innerHTML = d2;
  }
}

function jumpToBoard() {
  window.location.href = "board.html";
}