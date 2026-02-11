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
const ADMIN_API_KEY = '698c36e739e45f0001203bfb:371b8d6950caa342371e5b924ec26b513450b24dc2d87d27a3beb701002082bc';

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
      title: meta.TITOLO,
      slug: meta.SLUG,
      html: html,
      tags: meta.TAGS ? meta.TAGS.split(',').map(t => t.trim()) : [],
      status: 'draft'   // <-- qui
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
