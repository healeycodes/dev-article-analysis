const analysisSection = document.querySelector(".analysis");
const userInput = document.querySelector("[name=user]");

// Grab the username from the form, send it to the server and show updates
function getStats() {
  const user = userInput.value;
  userInput.value = "";

  const socket = new WebSocket(`wss://${location.host}/user?name=${user}`);

  socket.addEventListener("open", function(event) {
    analysisSection.innerText += "Connected";
    analysisSection.innerText += "\n";
  });

  socket.addEventListener("message", function(event) {
    analysisSection.innerText += event.data;
    analysisSection.innerText += "\n";
  });
}
