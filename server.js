const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// CONFIGURAZIONE
const GHOST_URL = 'https://ustat-prove.ghost.io';
const ADMIN_API_KEY = 'INCOLLA QUI LA TUA ADMIN API KEY';

function createJWT() {
  const [id, secret] = ADMIN_API_KEY.split(':');
  return jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
  });
}

app.post('/publish', async (req, res) => {
  const { title, slug, html, tags } = req.body;

  try {
    const token = createJWT();

    const payload = {
      posts: [{
        title,
        slug,
        html,
        status: 'published',
        tags: tags ? tags.map(t => ({ name: t })) : []
      }]
    };

    const response = await fetch(`${GHOST_URL}/ghost/api/admin/posts/?source=html`, {
      method: 'POST',
      headers: {
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Ghost Publisher API attivo 🚀');
});

app.listen(PORT, () => {
  console.log('Server avviato sulla porta', PORT);
});
