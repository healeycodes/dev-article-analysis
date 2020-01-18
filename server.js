const devApi = require("./devApi");
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);

app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.ws("/user", function(ws, req) {
  const name = req.query.name;
  devApi(name, ws);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
