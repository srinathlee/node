const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initiliseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at port 3000");
    });
  } catch (e) {
    console.log(e);
  }
};

initiliseDbAndServer();

//get players api

app.get("/players/", async (request, response) => {
  const sqlQuery = `
    SELECT 
    *
    FROM
    cricket_team
    ORDER BY
    player_id;
    `;
  const players = await db.all(sqlQuery);
  //   const obj = (players) => {
  //     return {
  //       playerId: players.player_id,
  //       playerName: players.player_name,
  //       jerseyName: players.jersey_number,
  //       role: players.role,
  //     };
  //   };
  //   const a = obj(players);

  const newArray = players.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  }));

  response.send(newArray);
});

//post player api

app.post("/players/", async (request, response) => {
  const b = request.body;
  const { playerName, jerseyNumber, role } = b;
  const sqlQuery = `
    INSERT INTO
    cricket_team
    (player_name, jersey_number, role)
    VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');
    `;
  try {
    const dbResponse = await db.run(sqlQuery);
    const playerId = dbResponse.lastID;
    response.send("Player Added to Team");
  } catch (e) {
    response.send(e);
  }
});

//get specific player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE 
    player_id=${playerId};`;
  const player = await db.get(sqlQuery);
  const newPlayer = {
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
  response.send(newPlayer);
});

//update the player api

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const sqlQuery = `
  UPDATE 
  cricket_team
  SET 
  player_name='${playerName}', jersey_number=${jerseyNumber}, role='${role}'
   where
   player_id=${playerId};`;

  await db.run(sqlQuery);
  response.send("Player Details Updated");
});

//delete player api

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `
     DELETE FROM
     cricket_team
     WHERE
     player_id=${playerId};`;
  await db.run(sqlQuery);
  response.send("Player Removed");
});

module.exports = app;
