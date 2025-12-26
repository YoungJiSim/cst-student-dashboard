const API_URL = "http://localhost:3000/";

init();

function init() {
  drawCourseList();
  addCourseScheduleInputs();
  const addCourseScheduleBtn = document.getElementById("addCourseScheduleBtn");
  addCourseScheduleBtn.addEventListener("click", addCourseScheduleInputs);

  const courseModalCloseBtn = document.getElementById("courseModalCloseBtn");
  courseModalCloseBtn.addEventListener("click", resetCourseModal);

  const minuteInterval = drawWeeklyCalendar();
  resizeCalendar();

  insertCoursesToCalendar(minuteInterval);
}

async function getCourses() {
  try {
    const result = await fetch(`${API_URL}courses`)
      .then((response) => response.json())
      .then((data) => data);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function drawCourseList() {
  const courses = await getCourses();
  if (!courses) return;

  const courseList = document.getElementById("courseList");

  courses.forEach((course) => {
    const code = course.code;
    const name = course.name;
    const courseLi = document.createElement("li");
    courseLi.className = "list-group-item";
    courseLi.innerHTML = `<div class="courseCodesAndNames"><span>${code} </span><h6>${name}</h6><div>`;
    courseList.append(courseLi);
  });
}

function addCourseScheduleInputs() {
  const scheduleSets = document.createElement("div");
  scheduleSets.className = "scheduleSets";
  scheduleSets.innerHTML = `<div class="row">
              <div class="col">
                <label for="CRN" class="form-label">CRN</label>
                <input type="text" class="CRN form-control form-control-sm" name="CRN" />
              </div>
              <div class="col">
                <label for="classType" class="form-label">Class Type</label>
                <select name="classType" class="classType form-control form-control-sm">
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <label for="day" class="form-label">Day</label>
                <select name="day" class="day form-control form-control-sm">
                  <option value="mon">MON</option>
                  <option value="tue">TUE</option>
                  <option value="wed">WED</option>
                  <option value="thu">THU</option>
                  <option value="fri">FRI</option>
                </select>
              </div>
              <div class="col">
                <label for="classroom" class="form-label">Classroom</label>
                <input type="text" class="classroom form-control form-control-sm" name="classroom" />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <label for="startTime" class="form-label">Class Start</label>
                <input type="time" class="startTime form-control form-control-sm" name="startTime" />
              </div>
              <div class="col">
                <label for="endTime" class="form-label">Class End</label>
                <input type="time" class="endTime form-control form-control-sm" name="endTime" />
              </div>
            </div>
            <div class="deleteCourseScheduleBtnDivs">
              <button type="button" class="btn btn-outline-danger btn-sm deleteCourseScheduleBtns" onClick="deleteSchedule(this)">
              Delete Schedule
              </button>
            </div>`;

  const scheduleFieldset = document.getElementById("scheduleFieldset");
  scheduleFieldset.append(scheduleSets);
}

function deleteSchedule(self) {
  self.parentNode.parentNode.remove();
}

function resetCourseModal() {
  document.getElementById("courseForm").reset();
  const scheduleSets = document.getElementsByClassName("scheduleSets");
  for (let i = scheduleSets.length - 1; i > 0; i--) {
    scheduleSets[i].remove();
  }
}

function drawWeeklyCalendar() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const weeklyCalendar = document.getElementById("weeklyCalendar");
  const startHour = 6;
  const endHour = 27;
  const minuteInterval = 30;
  const calendarDays = 7;

  for (let i = startHour - 1; i < endHour; i++) {
    for (let j = 0; j < 60; j += minuteInterval) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      const hour = i.toString().padStart(2, "0");
      const minute = j.toString().padStart(2, "0");
      const timeString = hour + minute;

      if (i < startHour) {
        th.innerText = "TIME";
        j += 60;
      } else {
        th.innerText = timeString;
      }
      tr.append(th);
      for (let k = 0; k < calendarDays; k++) {
        if (i < startHour) {
          const daysTh = document.createElement("th");
          daysTh.innerText = days[k];
          tr.append(daysTh);
        } else {
          const td = document.createElement("td");
          td.className = days[k] + "-" + hour;
          td.id = days[k] + "-" + timeString;
          tr.append(td);
        }
      }
      weeklyCalendar.append(tr);
    }
  }
  return minuteInterval;
}

function resizeCalendar() {
  const weeklyCalendar = document.getElementById("weeklyCalendar");
  const calendarOuterBoxId = weeklyCalendar.parentElement.id;
  const calendarOuterBox = document.getElementById(calendarOuterBoxId);

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      weeklyCalendar.style.width = entry.contentRect.width - 10 + "px";
    }
  });

  observer.observe(calendarOuterBox);
}

async function getCourseSchedules() {
  try {
    const result = await fetch(`${API_URL}courseSchedules`)
      .then((response) => response.json())
      .then((data) => data);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function insertCoursesToCalendar(minuteInterval) {
  const courses = await getCourseSchedules();
  if (!courses) return;

  courses.forEach((course) => {
    const day = course.day;
    const time = course.time;
    const startTime = time.slice(0, 4);
    let endTime = time.slice(5);
    let endHour = parseInt(endTime.slice(0, 2));
    let endMinute = parseInt(endTime.slice(2));

    const remainder = endMinute % minuteInterval;
    if (remainder != 0) {
      endMinute = minuteInterval - remainder + endMinute;
      if (endMinute == 0) endHour += 1;
    }
    endTime = endHour.toString() + endMinute.toString();

    const minuteDiff = timeDiff(startTime, endTime);
    const tdCount = minuteDiff / minuteInterval;

    const tdId = day + "-" + startTime;
    removeTd(tdId, tdCount, minuteInterval);

    const scheduleTd = document.getElementById(tdId);
    scheduleTd.setAttribute("rowspan", tdCount);
    scheduleTd.innerHTML = `
      ${course.code}<br>
      <span class="courseNameSpans">${course.name}</span><br>
      ${course.classType}<br>
      ${course.time}<br>
      ${course.classroom}<br>
      `;
  });
}

function timeDiff(startTime, endTime) {
  const startHour = parseInt(startTime.slice(0, 2));
  const startMinute = parseInt(startTime.slice(2));
  const endHour = parseInt(endTime.slice(0, 2));
  const endMinute = parseInt(endTime.slice(2));
  return (endHour - startHour) * 60 + endMinute - startMinute;
}

function removeTd(tdId, tdCount, minuteInterval) {
  const day = tdId.slice(0, 3);
  const startHour = tdId.slice(4, 6);
  const startHourToMinute = parseInt(startHour) * 60;
  const startMinute = startHourToMinute + parseInt(tdId.slice(6, 8));
  const endMinute = startMinute + minuteInterval * tdCount;
  for (
    let i = startMinute + minuteInterval;
    i < endMinute;
    i += minuteInterval
  ) {
    const targetTimeInMinute = i;
    const targetTimeHour = parseInt(targetTimeInMinute / 60)
      .toString()
      .padStart(2, 0);
    const targetTimeMinute = (targetTimeInMinute % 60)
      .toString()
      .padStart(2, 0);

    const targetTd = document.getElementById(
      day + "-" + targetTimeHour + targetTimeMinute
    );
    if (targetTd) targetTd.remove();
  }
}
