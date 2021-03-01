const express = require('express');
const { google } = require('googleapis');

const cookieParser = require('cookie-parser');
const exphbs  = require('express-handlebars');

const { authCheck } = require('./middleware/authCheck');
const { googleAuth } = require('./googleAuth');

const app = express();

app.use(cookieParser());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const youtube = google.youtube({
  version: 'v3',
  auth: googleAuth,
});

app.get('/auth/redirect', async (req, res) => {
  if (!req.query.code) return res.status(400);
  const { tokens } = await googleAuth.getToken(req.query.code);
  res.cookie('google_tokens', tokens, { maxAge: 1000 * 60 * 60, httpOnly: true }).redirect('/dashboard');
});

app.get('/dashboard', authCheck, async (req, res) => {
  res.render('dashboard');
});

app.get('/streams', authCheck, async (req, res) => {
  try {    
    const livestreams = await youtube.liveBroadcasts.list({ part: 'snippet,contentDetails', broadcastStatus: 'upcoming' });
    console.log(livestreams.data.items);
    res.render('streams', { streams: livestreams.data.items });
  } catch (error) {
    console.error('ERROR - /streams:', error);
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
  return res.render('home', { url });
});

app.get('/logout', (req, res) => {
  return res.clearCookie('google_tokens').redirect('/');
});

app.listen(8080);
console.log("Listening on port 8080");