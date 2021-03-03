const express = require('express');
const {
  google
} = require('googleapis');
const { config } = require('./config');
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
    model: {
      path: {
        dashboard: 'dashboard'
      },
      loggedIn: true,
    }
  });
});

app.get('/streams', authCheck, async (req, res) => {
  try {
    const livestreams = await youtube.liveBroadcasts.list({
      part: 'snippet,contentDetails',
      broadcastStatus: 'upcoming'
    });
    console.log(livestreams.data.items);

    let formattedStreams = livestreams.data.items.map(o => ({
      id: o.id,
      title: o.snippet.title,
      description: o.snippet.description,
      startTime: o.snippet.scheduledStartTime,
      thumbnail: o.snippet.thumbnails.standard,
      videoLink: 'https://www.youtube.com/watch?v=' + o.id,
      //This link with "livestreaming" on the end redirects to the YT studio with broken homepage
      studioLink: 'https://studio.youtube.com/video/'+ o.id /* +'/livestreaming' */,
      enableAutoStart: o.contentDetails.enableAutoStart,
    }))
    /* console.log('formattedStreams:', formattedStreams); */
    res.render('streams', {
      model: {
        streams: formattedStreams,
        path: {
          streams: 'streams'
        },
        loggedIn: true,
      }
    });
  } catch (e) {
    /* console.error('ERROR - /streams:', e); */
    console.error('ERROR - /streams:', e);
    if(e.errors){
      res.render('streams', {
        model: {
          error: {
            errorMessage: e.errors[0].message,
            helpLink: e.errors[0].extendedHelp,
            code: e.code
          },
          path: {
            streams: 'streams'
          },
          loggedIn: true,
        }
      })
    } else{
      res.redirect('/');
    }
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
      path: {
        home: 'home'
      },
      loggedIn: false,
    }
  });
});

app.get('/logout', (req, res) => {
  return res.clearCookie('google_tokens').redirect('/');
});

app.listen(config.port || 8080);
console.log("Listening on port", config.port || 8080);