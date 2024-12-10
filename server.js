import express from "express";
import cors from "cors";
import pg from "pg";
const { Pool } = pg;

const app = express();

app.use(express.json());
app.use(cors());

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'likeme',
    allowExitOnIdle: true
})

app.get("/posts", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM posts");
        res.send(rows)
    } catch (error) {
        res.status(500).send("Error del servidor")
    }
})

app.post("/posts", async (req, res) => {
    try {
        const { titulo, url, descripcion } = req.body;
        const argumentos = {
            text: "INSERT INTO posts (titulo, img, descripcion) VALUES($1, $2, $3)",
            values: [titulo, url, descripcion]
        }
        await pool.query(argumentos)
        res.send("Post agregado con éxito")
    } catch (error) {
        const { code } = error
        if (code == "23502") {
            res.status(400).send("Se ha violado la restricción NOT NULL en uno de los campos de la tabla")
        } else {
            res.status(500).send("Errpr interno del servidor")
        }
    }
})

app.delete("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const argumentos = {
            text: "DELETE FROM posts WHERE id= $1",
            values: [id]
        }
        const result = await pool.query(argumentos)
        const {rowCount} = result;
        if(rowCount == 0) {
            return res.json({code: 404, message: "No se consiguió ningún viaje con este id"})
        }
        res.send("Post eliminado con éxito")
    } catch (error) {
        res.status(500).send("Error del servidor")
    }
})

app.put("/posts/like/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("SELECT likes FROM posts WHERE id= $1", [id]);
        const likes = rows[0].likes
        const newLike = likes + 1
        const argumentos = {
            text: "UPDATE posts SET likes=$2 WHERE id=$1",
            values: [id, newLike]
        }
        const result = await pool.query(argumentos)
        const {rowCount} = result;
        if(rowCount == 0) {
            return res.json({code: 404, message: "No se consiguió ningún viaje con este id"})
        }
        res.send("Post actualizado con éxito")
    } catch (error) {
        res.status(500).send("Error del servidor")
    }
})

app.listen(3000, console.log("Escuchando desde el puerto 3000"))
