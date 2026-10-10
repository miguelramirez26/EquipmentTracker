const express = require('express');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();
const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === 'production';
const callbackURL =
  process.env.CALLBACK_URL ||
  (process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/auth/github/callback`
    : isProduction
      ? null
      : 'http://localhost:8080/auth/github/callback');

if (!callbackURL) {
  throw new Error(
    'Set CALLBACK_URL or RENDER_EXTERNAL_URL to the public OAuth callback URL in production.'
  );
}

app.use(express.json());
app.use(cors());

app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: 'lax',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL,
    },
    (accessToke, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

// 1. Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. Mount authentication and API routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/writeOperations'));
app.use('/', require('./routes/maintenanceReservationsWrite'));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

app.get('/', (req, res) => {
  const username = req.isAuthenticated()
    ? req.user?.username || req.user?.displayName
    : null;
  const userHeading = username
    ? `<p>Signed in as ${escapeHtml(username)}</p>`
    : '';

  return res
    .type('html')
    .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Equipment Tracker API</title>
  </head>
  <body>
    ${userHeading}
    <h1>Equipment Tracker API</h1>
    <nav>
      <a href="/auth/github">Login with GitHub</a>
      <a href="/logout">Logout</a>
      <a href="/api-docs">API Docs</a>
    </nav>
  </body>
</html>`);
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }

  console.error('Request failed:', error.message);
  return res.status(500).json({ error: 'Internal server error' });
});

mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
  } else {
    app.listen(port, () => {
      console.log(`Connected to DB and listening on port ${port}`);
    });
  }
});