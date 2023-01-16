const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
var pjson = require("./package.json");

const config = {
  user: "db_usip_user",
  database: "db_usip",
  password: "PjNH2uxgqIQtRLyYJzjZWAqD5uJvLoFT",
  host: "dpg-cf29kp6n6mpkr6dp2beg-a.oregon-postgres.render.com",
  port: 5432,
  ssl: true,
  idleTimeoutMillis: 30000,
};

const client = new pg.Pool(config);

// Modelo
class UsuariosModel {
  constructor() {
    this.todos = [];
  }

  async getUsuarios() {
    const res = await client.query("select * from usuarios;");
    console.log(res);
    return res.rows;
  }

  async addUsuario(nombreCompleto, edad) {
    const query =
      "INSERT INTO usuarios(nombreCompleto, edad) VALUES($1, $2) RETURNING *;";
    const values = [nombreCompleto, edad];
    const res = await client.query(query, values);
    return res.rows;
  }

  async promedioEdad() {
    const res = await client.query(
      "select sum(u.edad)/count(u.edad) as promedioedad from usuarios u;"
    );
    console.log(res);
    return res.rows[0].promedioedad;
  }

  editTodo(index, todoText) {
    this.todos[index].text = todoText;
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
  }

  toggleTodo(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

// Controlador
class UsuariosController {
  constructor(model) {
    this.model = model;
  }

  async getUsuarios() {
    return await this.model.getUsuarios();
  }

  async addUsuario(nombreCompleto, edad) {
    return await this.model.addUsuario(nombreCompleto, edad);
  }

  async promedioEdad() {
    return await this.model.promedioEdad();
  }

  editTodo(index, todoText) {
    this.model.editTodo(index, todoText);
  }

  deleteTodo(index) {
    this.model.deleteTodo(index);
  }

  toggleTodo(index) {
    this.model.toggleTodo(index);
  }
}

// Vistas (Rutas)
const app = express();
const usuariosModel = new UsuariosModel();
const usuariosController = new UsuariosController(usuariosModel);

app.use(bodyParser.json());

app.get("/usuarios", async (req, res) => {
  const response = await usuariosController.getUsuarios();
  res.json(response);
});

app.post("/usuarios", async (req, res) => {
  let nombreCompleto = req.body.nombreCompleto;
  let edad = req.body.edad;
  if (nombreCompleto != null && edad != null) {
    console.log("request: ", req.body);
    const response = await usuariosController.addUsuario(nombreCompleto, edad);
    console.log("response: ", response);
    res.json(response);
  } else {
    res.sendStatus(400);
  }
});

app.get("/usuarios/promedio-edad", async (req, res) => {
  const response = await usuariosController.promedioEdad();
  console.log("response: ", response);
  res.json({ promedioEdad: response });
});

app.get("/status", async (req, res) => {
  res.json({
    nameSystem: pjson.name,
    version: pjson.version,
    developer: pjson.author,
    email: "ardennmar@gmail.com",
  });
});

app.put("/todos/:index", (req, res) => {
  const index = req.params.index;
  const todoText = req.body.text;
  usuariosController.editTodo(index, todoText);
  res.sendStatus(200);
});

app.delete("/todos/:index", (req, res) => {
  const index = req.params.index;
  usuariosController.deleteTodo(index);
  res.sendStatus(200);
});

app.patch("/todos/:index", (req, res) => {
  const index = req.params.index;
  usuariosController.toggleTodo(index);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
