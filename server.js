const express = require('express');
const {
  google
} = require('googleapis');

const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const helpers = require('./helpers/helpers');
const {
  authCheck
} = require('./middleware/authCheck');
const {
  googleAuth
} = require('./googleAuth');

const app = express();
app.use(express.static('public'));
app.use(cookieParser());

app.engine('handlebars', hbs({
  extname: 'handlebars',
  defaultLayout: 'main',
  helpers: helpers,
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');

const youtube = google.youtube({
  version: 'v3',
  auth: googleAuth,
});


//Routing -------------
app.get('/auth/redirect', async (req, res) => {
  if (!req.query.code) return res.status(400);
  const {
    tokens
  } = await googleAuth.getToken(req.query.code);
  res.cookie('google_tokens', tokens, {
    maxAge: 1000 * 60 * 60,
    httpOnly: true
  }).redirect('/dashboard');
});

app.get('/dashboard', authCheck, async (req, res) => {
  res.render('dashboard', {
    path: {dashboard: 'dashboard'},
  });
});

app.get('/streams', authCheck, async (req, res) => {
  try {
    const livestreams = await youtube.liveBroadcasts.list({
      part: 'snippet,contentDetails',
      broadcastStatus: 'upcoming'
    });
    console.log(livestreams.data.items);
    res.render('streams', {
      model: {
        streams: livestreams.data.items,
        path: {streams: 'streams'},
      }
    });
  } catch (e) {
    /* console.error('ERROR - /streams:', e); */
    console.error('ERROR - /streams:', e.errors);
    res.render('streams', {
      model: {
        error: {
          errorMessage: e.errors[0].message,
          helpLink: e.errors[0].extendedHelp,
          code: e.code
        },
        path: {streams: 'streams'},
      }
    })
  }
});

app.get('/', (req, res) => {
  if (req.cookies.google_tokens) {
    return res.redirect('/dashboard');
  }
  const url = googleAuth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube'],
  });
  return res.render('home', {
    model: {
      url,
      path: {home: 'home'},
    }
  });
});

app.get('/logout', (req, res) => {
  return res.clearCookie('google_tokens').redirect('/');
});

app.listen(8080);
console.log("Listening on port 8080");