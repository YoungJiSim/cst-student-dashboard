const API_URL = "http://localhost:3000/";

init();

function init() {
  drawCourseList();
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
