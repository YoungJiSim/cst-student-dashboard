const courses = [
  {
    code: "COMP 2121",
    name: "Discrete Mathematics",
    instructor: "Simin Jolfaee",
    credit: 4,
    schedule: [
      {
        CRN: 86154,
        classType: "Lecture",
        day: "TUE",
        time: "0830-1020",
        classroom: "DTC 581",
      },
      {
        CRN: 72567,
        classType: "Lab",
        day: "TUE",
        time: "1330-1520",
        classroom: "DTC 686",
      },
    ],
  },
];

init();

function init() {
  drawWeeklyCalendar();
  resizeCalendar();
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
      tr.className = "table table-bordered";
      const th = document.createElement("th");
      th.className = "table table-bordered";
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
          daysTh.className = "table table-bordered";
          daysTh.innerText = days[k];
          tr.append(daysTh);
        } else {
          const td = document.createElement("td");
          td.className = "table table-bordered " + days[k] + "-" + hour;
          td.id = days[k] + "-" + timeString;
          tr.append(td);
        }
      }
      weeklyCalendar.append(tr);
    }
  }
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
