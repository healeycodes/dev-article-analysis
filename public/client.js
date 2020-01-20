const chartsSection = document.querySelector(".charts");
const progressSection = document.querySelector(".progress");
const readingGradeSection = document.querySelector(".reading-grade");
const readingEaseSection = document.querySelector(".reading-ease");
const sentimentSection = document.querySelector(".sentiment");
const userInput = document.querySelector("[name=user]");
let charts = [];

// Cleanup old charts
function cleanUp() {
  chartsSection.style.display = "none";
  readingGradeSection.innerHTML = "";
  readingEaseSection.innerHTML = "";
  sentimentSection.innerHTML = "";
  charts.forEach(chart => chart.destroy());
  charts = [];
}

// Grab the username from the form, send it to the server and show updates
function getStats() {
  const user = userInput.value;
  if (user.length === 0) return;
  cleanUp();
  userInput.value = "";

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}/user?name=${user}`);

  socket.addEventListener("open", function(event) {
    progressSection.innerText = "Connected";
  });

  socket.addEventListener("message", function(event) {
    const data = JSON.parse(event.data);
    if ("result" in data) {
      drawCharts(data.result);
    }
    progressSection.innerText = data.msg;
  });
}

// Render textual analysis charts
function drawCharts(data) {
  if (data.length === 0) {
    progressSection.innerHTML = "No data found for that user.";
    return;
  }
  chartsSection.style.display = "block";

  const style = {
    height: 400,
    type: "line",
    zoom: {
      enabled: false
    }
  };
  const grid = {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5
    }
  };

  const readingGradeChart = new ApexCharts(readingGradeSection, {
    series: [
      {
        name: "Reading level",
        data: data.map(article => article.readability.fleschKincaidGrade)
      }
    ],
    chart: style,
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight",
      colors: ["#3282b8"]
    },
    title: {
      text: "Readability scored as a U.S. grade level.",
      align: "left"
    },
    grid: grid,
    xaxis: {
      categories: data.map(article => article.title)
    }
  });
  readingGradeChart.render();
  charts.push(readingGradeChart);

  const readingEaseChart = new ApexCharts(readingEaseSection, {
    series: [
      {
        name: "Reading Ease",
        data: data.map(article => article.readability.fleschReadingEase)
      }
    ],
    chart: style,
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight",
      colors: ["#0f4c75"]
    },
    title: {
      text: "Higher scores indicate the article is easier to read.",
      align: "left"
    },
    grid: grid,
    xaxis: {
      categories: data.map(article => article.title)
    }
  });
  readingEaseChart.render();
  charts.push(readingEaseChart);

  const sentimentChart = new ApexCharts(sentimentSection, {
    series: [
      {
        name: "Comparative score",
        data: data.map(article => article.sentiment.toFixed(5))
      }
    ],
    chart: style,
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight",
      colors: ["#1b262c"]
    },
    title: {
      text: "A scale of emotional polarity. Higher is positive.",
      align: "left"
    },
    grid: grid,
    xaxis: {
      categories: data.map(article => article.title)
    }
  });
  sentimentChart.render();
  charts.push(sentimentChart);
}

// Render example data from username: healeycodes
fetch("/example-data")
  .then(res => res.json())
  .then(data => drawCharts(data));
