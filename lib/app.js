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
  const data = await client.query('SELECT * from regattas');

  res.json(data.rows);
});

app.get('/regattas/:id', async(req, res) => {
  const regattaId = this.params.id;

  const data = await client.query(`SELECT * from regattas where id=${regattaId}`);

  res.json(data.rows);
});

app.post('/regattas', async(req, res) => {
  const newRegatta = {
    name: req.body.name,
    type: req.body.type,
    city: req.body.city,
    length_km: req.body.length_km,
    recommend: req.body.recommend,
  };

  const data = await client.query(`
  INSERT INTO regattas(name, type, city, length_km, recommmend)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
  `, [newRegatta.name, newRegatta.type, newRegatta.city, newRegatta.length_km, newRegatta.recommend]);

  res.json(data.rows[0]);
});

app.use(require('./middleware/error'));

module.exports = app;
