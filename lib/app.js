require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
}); 

app.get('/regattas', async(req, res) => {
  try {
    const data = await client.query(`
        Select r.id, name, t.type AS type_id, city, length_km, recommend
          FROM regattas AS r
          JOIN raceTypes AS t
          ON r.type_id = t.id
    `);
    
    res.json(data.rows);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/types', async(req, res) => {
  const data = await client.query(`
      SELECT * FROM raceTypes`);

  res.json(data.rows);
});

app.get('/types/:id', async(req, res) => {

  try {
    const regattaTypeId = req.params.id;
    const data = await client.query(`
    Select r.id, name, t.type AS type_id, city, length_km, recommend
      FROM regattas AS r
      JOIN raceTypes AS t
      ON r.type_id=t.id
      WHERE r.type_id=$1
`, [regattaTypeId]);
  
    res.json(data.rows);
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }

});
app.get('/regattas/:id', async(req, res) => {

  try {
    const regattaId = req.params.id;
    const data = await client.query(`
    Select r.id, name, t.id AS type_id, city, length_km, recommend
      FROM regattas AS r
      JOIN raceTypes AS t
      ON r.type_id=t.id
      WHERE r.id=$1
`, [regattaId]);
  
    res.json(data.rows[0]);
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }

});

app.post('/regattas', async(req, res) => {
  
  try {

    const newRegatta = {
      name: req.body.name,
      type_id: req.body.type_id,
      city: req.body.city,
      length_km: req.body.length_km,
      recommend: req.body.recommend,
    };
  
    const data = await client.query(`
    INSERT INTO regattas(name, type_id, city, length_km, recommend)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `, [newRegatta.name, newRegatta.type_id, newRegatta.city, newRegatta.length_km, newRegatta.recommend]);
  
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
  
});

app.delete('/regattas/:id', async(req, res) => {
  const regattaId = req.params.id;

  const data = await client.query('DELETE FROM regattas WHERE regattas.id=$1;', [regattaId]);

  res.json(data.rows[0]);
});

app.put('/regattas/:id', async(req, res) => {
  
  const regattaId = req.params.id;

  try {
    
    const newRegatta = {
      name: req.body.name,
      type_id: req.body.type_id,
      city: req.body.city,
      length_km: req.body.length_km,
      recommend: req.body.recommend,
    };
  
    const data = await client.query(`
    UPDATE regattas
      set name=$1, type_id=$2, city=$3, length_km=$4, recommend=$5
      WHERE regattas.id=$6
    RETURNING *
    `, [newRegatta.name, newRegatta.type_id, newRegatta.city, newRegatta.length_km, newRegatta.recommend, regattaId]);
  
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
  
});

app.use(require('./middleware/error'));

module.exports = app;
