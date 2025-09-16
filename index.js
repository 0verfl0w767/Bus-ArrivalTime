var roadview0 = new naver.maps.Panorama("roadview0", {
  position: new naver.maps.LatLng(37.61982667766899, 127.08598789076868),
  size: new naver.maps.Size(800, 600),
  pov: {
    pan: -20,
    tilt: -1.09,
    fov: 61,
  },
  flightSpot: false,
});

var roadview1 = new naver.maps.Panorama("roadview1", {
  position: new naver.maps.LatLng(37.61809997730864, 127.07714238082085),
  size: new naver.maps.Size(800, 600),
  pov: {
    pan: -154.01,
    tilt: -2.54,
    fov: 80,
  },
  flightSpot: false,
});

var roadview2 = new naver.maps.Panorama("roadview2", {
  position: new naver.maps.LatLng(37.615175076906795, 127.06742546974361),
  size: new naver.maps.Size(800, 600),
  pov: {
    pan: -116,
    tilt: -6.98,
    fov: 80,
  },
  flightSpot: false,
});

window.addEventListener("resize", resize);

function resize() {
  const model0 = document.getElementById("modal-content0");
  const Size0 = new naver.maps.Size(model0.offsetWidth, model0.offsetHeight);
  roadview0.setSize(Size0);

  const model1 = document.getElementById("modal-content1");
  const Size1 = new naver.maps.Size(model1.offsetWidth, model1.offsetHeight);
  roadview1.setSize(Size1);

  const model2 = document.getElementById("modal-content2");
  const Size2 = new naver.maps.Size(model2.offsetWidth, model2.offsetHeight);
  roadview2.setSize(Size2);
}

/*function initRoadview() {
  var roadviewContainer1 = document.getElementById('roadview1');
  var roadview1 = new kakao.maps.Roadview(roadviewContainer1, {
    panoId: 1182699357,
    panoX: 517027,
    panoY: 1144035,
    pan: 212.9,
    tilt: 6.2,
    zoom: 0,
  });

  var roadviewContainer2 = document.getElementById('roadview2');
  var roadview2 = new kakao.maps.Roadview(roadviewContainer2, {
    panoId: 1182694914,
    panoX: 514897,
    panoY: 1143235,
    pan: 234.3,
    tilt: 13.1,
    zoom: 0,
  });
}*/

function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
  resize();
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

document.getElementById("closeModal0").onclick = function () {
  closeModal("modal0");
};
document.getElementById("closeModal1").onclick = function () {
  closeModal("modal1");
};
document.getElementById("closeModal2").onclick = function () {
  closeModal("modal2");
};

window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal("modal0");
    closeModal("modal1");
    closeModal("modal2");
  }
};

//initRoadview();

function showStation(station) {
  const stations = ["화랑대역", "태릉입구역", "석계역", "별내역"];
  stations.forEach((s) => {
    document.getElementById(s).style.display = s === station ? "block" : "none";
  });
}
async function fetchBusData() {
  try {
    const response = await fetch("/api/monitor");
    const data = await response.json();
    displayBusData(data);
  } catch (error) {
    console.error("데이터를 가져오는 데 실패했습니다:", error);
  }
}

function dateFormat(date) {
  const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  let week = WEEKDAY[date.getDay()];
  month = month >= 10 ? month : "0" + month;
  day = day >= 10 ? day : "0" + day;
  hour = hour >= 10 ? hour : "0" + hour;
  minute = minute >= 10 ? minute : "0" + minute;
  second = second >= 10 ? second : "0" + second;
  return (
    date.getFullYear() +
    "-" +
    month +
    "-" +
    day +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second +
    " " +
    week
  );
  // return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ' ' + week
}

function dayCount(d1, d2) {
  const date = new Date(d1).getTime() - new Date(d2).getTime();
  return Math.abs(date / (1000 * 60 * 60 * 24));
}

function displayBusData(data) {
  const stationsToFilter = ["화랑대역", "태릉입구역", "석계역", "별내역"];
  const groupedData = {
    화랑대역: {},
    태릉입구역: {},
    석계역: {},
    별내역: {},
  };

  for (const key in data) {
    const busData = data[key];
    for (let i = 0; i < busData.length; i++) {
      const entry = { ...busData[i], busNumber: key };
      const entryDate = new Date(entry.time);

      if (
        dayCount(
          dateFormat(new Date(entry.time)).split(" ")[0] + " " + "08:00:00",
          new Date(),
        ) <= 10
      ) {
        // if (dayCount(dateFormat(new Date(entry.time)).split(" ")[0] + " " + "08:00:00", new Date()) <= 100) {
        if (stationsToFilter.includes(entry.busstop)) {
          const dateKey = dateFormat(new Date(entry.time)).split(" ")[0];

          if (!groupedData[entry.busstop][dateKey]) {
            groupedData[entry.busstop][dateKey] = [];
          }

          // 이전 시간 체크
          const lastEntry =
            groupedData[entry.busstop][dateKey].length > 0
              ? groupedData[entry.busstop][dateKey][
                  groupedData[entry.busstop][dateKey].length - 1
                ]
              : null;

          if (lastEntry) {
            const lastEntryDate = new Date(lastEntry.time);
            const timeDifference = (entryDate - lastEntryDate) / (1000 * 60);

            // 버스가 같고 도착 시간이 5분 이내인 경우
            if (
              lastEntry.busNumber === entry.busNumber &&
              timeDifference <= 5
            ) {
              continue;
            }
          }

          if (entry.busstop === "화랑대역") {
            if (new Date(entry.time).getHours() >= 12) {
              continue;
            }
            if (!groupedData["화랑대역"][dateKey]) {
              groupedData["화랑대역"][dateKey] = [];
            }
            groupedData["화랑대역"][dateKey].push(entry);
          } else if (
            entry.busstop === "태릉입구역" &&
            i > 0 &&
            busData[i - 1].busstop === "월릉교"
          ) {
            if (!groupedData["태릉입구역"][dateKey]) {
              groupedData["태릉입구역"][dateKey] = [];
            }
            groupedData["태릉입구역"][dateKey].push(entry);
          } else if (entry.busstop === "석계역" || entry.busstop === "별내역") {
            if (!groupedData[entry.busstop][dateKey]) {
              groupedData[entry.busstop][dateKey] = [];
            }
            groupedData[entry.busstop][dateKey].push(entry);
          }
        }
      }
    }
  }

  stationsToFilter.forEach((station) => {
    const stationDiv = document.getElementById(station);
    const stationHeader = document.createElement("h1");
    stationHeader.innerText = station;
    stationDiv.appendChild(stationHeader);

    const exitInfo = document.createElement("span");
    let buttonHTML = "";

    if (station === "화랑대역") {
      exitInfo.innerHTML = " (5번 출구)";
      buttonHTML =
        '<span id="btnRoadview1" onclick="openModal(\'modal0\');" style="cursor: pointer; color: #787878; margin: 8px;">로드뷰 확인</span>';
    } else if (station === "태릉입구역") {
      exitInfo.innerHTML = " (7번 출구)";
      buttonHTML =
        '<span id="btnRoadview1" onclick="openModal(\'modal1\');" style="cursor: pointer; color: #787878; margin: 8px;">로드뷰 확인</span>';
    } else if (station === "석계역") {
      exitInfo.innerHTML = " (4번 출구)";
      buttonHTML =
        '<span id="btnRoadview2" onclick="openModal(\'modal2\');" style="cursor: pointer; color: #787878; margin: 8px;">로드뷰 확인</span>';
    }

    exitInfo.innerHTML += buttonHTML;
    exitInfo.style.fontSize = "0.9rem";
    exitInfo.style.color = "#007bff";
    stationHeader.appendChild(exitInfo);

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-responsive";
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");

    const sortedDates = Object.keys(groupedData[station]).sort(
      (a, b) => new Date(a) - new Date(b),
    );
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

    sortedDates.forEach((dateStr) => {
      const dateObj = new Date(dateStr);
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dayOfWeek = daysOfWeek[dateObj.getDay()];

      const formattedDate = `${month}.${day}.(${dayOfWeek})`;
      headerRow.innerHTML += `<th>${formattedDate}</th>`;
    });
    table.appendChild(headerRow);

    const maxLength = Math.max(
      ...sortedDates.map((date) => {
        groupedData[station][date].sort(
          (a, b) => new Date(a.time) - new Date(b.time),
        );
        return groupedData[station][date].length;
      }),
    );

    for (let i = 0; i < maxLength; i++) {
      const timeRow = document.createElement("tr");

      sortedDates.forEach((date) => {
        const times = groupedData[station][date];
        const entry = times[i];
        // timeRow.innerHTML += `<td><b>${entry ? `${entry.time.split(" ")[1].slice(0, -3)}` : ""}</b></td>`;

        let displayTime = "";
        let style = "";

        if (entry) {
          const timeStr = entry.time.split(" ")[1].slice(0, -3);
          displayTime = timeStr;

          const now = new Date();

          const [hour, minute] = timeStr.split(":").map(Number);
          const entryDateTime = new Date(date);
          entryDateTime.setHours(hour, minute, 0, 0);

          const isSameDate = now.toISOString().slice(0, 10) === date;

          const diffMs = Math.abs(entryDateTime - now);
          const diffMinutes = diffMs / 1000 / 60;

          if (isSameDate && diffMinutes <= 5) {
            style = 'style="color:red;"';
          }
        }

        timeRow.innerHTML += `<td ${style}><b>${displayTime}</b></td>`;
      });

      table.appendChild(timeRow);
    }

    tableWrapper.appendChild(table);
    stationDiv.appendChild(tableWrapper);
  });

  document.getElementById("loading").style.display = "none";
  document.getElementById("footer").style.display = "block";
}

window.onload = () => {
  document.getElementById("loading").style.display = "block";
  document.querySelector(".spinner").style.display = "block";
  fetchBusData();
  showStation("화랑대역");
};
