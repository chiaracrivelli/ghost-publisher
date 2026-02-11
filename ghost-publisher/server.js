const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// 🔹 Abilita CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// CONFIGURAZIONE
const GHOST_URL = 'https://ustat-prove.ghost.io';
const ADMIN_API_KEY = '698c36e739e45f0001203bfb:371b8d6950caa342371e5b924ec26b513450b24dc2d87d27a3beb701002082bc'; // Copia da Ghost Admin API

function createJWT() {
  const [id, secret] = ADMIN_API_KEY.split(':');
  return jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
  });
}

// 🔹 Route per pubblicare articoli
app.post('/publish', async (req, res) => {
  const { title, slug, html, tags } = req.body;
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

  try {
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

// 🔹 Porta dinamica per Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Ghost Publisher avviato sulla porta ${PORT}`));
