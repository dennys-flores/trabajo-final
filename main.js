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
  constructor() {}

  async getUsuarios() {
    const res = await client.query("select * from usuarios order by id asc;");
    //  console.log(res);
    return res.rows;
  }

  async addUsuario(nombreCompleto, edad) {
    const query =
      "INSERT INTO usuarios(nombreCompleto, edad) VALUES($1, $2) RETURNING *;";
    const values = [nombreCompleto, edad];
    const res = await client.query(query, values);
    return res.rows[0];
  }

  async promedioEdad() {
    const res = await client.query(
      "select sum(u.edad)/count(u.edad) as promedioedad from usuarios u;"
    );
    //  console.log(res);
    return res.rows[0].promedioedad;
  }

  async editUsuario(index, nombreCompleto, edad) {
    const query =
      "UPDATE usuarios SET nombrecompleto=$1, edad=$2 WHERE id=$3 RETURNING *;";
    const values = [nombreCompleto, edad, index];
    const res = await client.query(query, values);
    //console.log(res);
    return res.rows[0];
  }

  async deleteUsuario(index) {
    const query = "DELETE FROM usuarios WHERE id=$1;";
    const values = [index];
    await client.query(query, values);
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

  async editUsuario(index, nombreCompleto, edad) {
    return await this.model.editUsuario(index, nombreCompleto, edad);
  }

  deleteUsuario(index) {
    this.model.deleteUsuario(index);
  }
}

// Vistas (Rutas)
const app = express();
const usuariosModel = new UsuariosModel();
const usuariosController = new UsuariosController(usuariosModel);

app.use(bodyParser.json());

app.get("/usuarios", async (req, res) => {
  console.log("Obtencion de usuarios:");
  const response = await usuariosController.getUsuarios();
  console.log("response: ", response);
  res.json(response);
});

app.post("/usuarios", async (req, res) => {
  console.log("Creacion de usuario:");
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
  console.log("Promedio de edad:");
  const response = await usuariosController.promedioEdad();
  console.log("response: ", response);
  res.json({ promedioEdad: response });
});

app.get("/status", async (req, res) => {
  console.log("Estado del servicio:");
  res.json({
    nameSystem: pjson.name,
    version: pjson.version,
    developer: pjson.author,
    email: "ardennmar@gmail.com",
  });
});

app.put("/usuarios/:index", async (req, res) => {
  console.log("Modificacion de usuario:");
  const index = req.params.index;
  if (index != null) {
    let nombreCompleto = req.body.nombreCompleto;
    let edad = req.body.edad;
    if (nombreCompleto != null && edad != null) {
      console.log("request: ", req.body);
      const response = await usuariosController.editUsuario(
        index,
        nombreCompleto,
        edad
      );
      console.log("response: ", response);
      res.json(response);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
});

app.delete("/usuarios/:index", (req, res) => {
  console.log("Eliminacion de usuario:");
  const index = req.params.index;
  if (index != null) {
    usuariosController.deleteUsuario(index);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
