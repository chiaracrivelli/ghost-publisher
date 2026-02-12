const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());  // <- usa express.json() al posto di body-parser

const PORT = process.env.PORT || 3000;

// CONFIGURAZIONE
const GHOST_URL = 'https://ustat-prove.ghost.io';
const ADMIN_API_KEY = '698c36e739e45f0001203bfb:...';

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
  // 🔹 Controllo che req.body esista
  if (!req.body) {
    return res.status(400).json({ error: 'body JSON mancante' });
  }

  const { title, slug, html, tags, status } = req.body;

  const token = createJWT();

  const payloadGhost = {
    posts: [{
      title,
      slug,
      html,
      status: status || 'draft',
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
      body: JSON.stringify(payloadGhost)
    });

    const text = await response.text();
    console.log("RISPOSTA GHOST:", text);
    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Ghost Publisher API attivo 🚀');
});

app.listen(PORT, () => console.log('Server avviato sulla porta', PORT));
