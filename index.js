/* eslint-disable */

/***********/
/* Init    */
/***********/
const low = require("lowdb");
const logger = require("./logger");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = express();
const jsonParser = bodyParser.json();
const whitelist = ["http://localhost:3000", "http://localhost:3001"];
server.use(cors({ origin: whitelist, credentials: true }));

const port = 8000;
const host = process.env.HOST;

/***********/
/* Routes  */
/***********/
server.get("/db", (req, res) => {
  res.json(db);
});

/*
// GET /data/{id}
server.get('/data/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = db.get('data')
                 .find({ id })
                 .value();

  res.json(data);
});
*/

server.get("/tasks", (req, res) => {
  const data = db.get("tasks").value();
  res.json({ payload: data });
});

server.post("/tasks", jsonParser, (req, res) => {
  const tasks = req.body;
  const data = db.get("tasks").value() || [];

  const newData = data.concat(tasks.map(t => ({ id: Date.now(), label: t })));
  const d = db.set("tasks", newData).write();

  res.json(d);
});

server.put("/task/:id", jsonParser, (req, res) => {
  const date = req.body.date;
  const id = Number(req.params.id);
  const data = db.get("tasks").value() || [];
  const task = data.filter(t => t.id === id)[0];

  const updatedTask = Object.assign(task, {
    dates: task.dates.includes(date)
      ? task.dates.filter(d => d !== date)
      : task.dates.concat(date)
  });
  const newData = data.filter(t => t.id !== id).concat(updatedTask);

  const d = db.set("tasks", newData).write();

  res.json(d);
});

/* 404 */
server.get("*", (req, res) => {
  res.status(404);
});

server.listen(port, host, err => {
  if (err) {
    return logger.error(err.message);
  }

  logger.appStarted(port, "localhost");
});
