// app.js
const pool = require('./db'); 
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Google Auth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    console.log("✅ GoogleStrategy triggered");
    console.log("Google profile:", profile);  // 👈 You want to see this
    (async () => {
        try {
          const googleId = profile.id;
          const name = profile.displayName;
          const email = profile.emails[0].value;
          const photo = profile.photos[0].value;
      
          const existingUser = await pool.query(
            'SELECT * FROM users WHERE google_id = $1',
            [googleId]
          );
      
          if (existingUser.rows.length === 0) {
            await pool.query(
              'INSERT INTO users (google_id, name, email, photo) VALUES ($1, $2, $3, $4)',
              [googleId, name, email, photo]
            );
          }
      
          return done(null, profile);
        } catch (err) {
          console.error('Error inserting user:', err);
          return done(err, null);
        }
      })();
      
  }));
  

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log("✅ Reached Google callback"); 
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
  
      req.session.destroy(() => {
        res.clearCookie('connect.sid', { path: '/' });
        res.status(200).send({ message: 'Logged out' });
      });
    });
  });
  
  

  app.get('/auth/user', async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.send(null);
    }
  
    try {
      const dbRes = await pool.query('SELECT * FROM users WHERE google_id=$1', [req.user.id]);
  
      if (dbRes.rows.length > 0) {
        return res.send({
          ...dbRes.rows[0],
          name: req.user.displayName,
          email: req.user.emails?.[0]?.value,
          photo: req.user.photos?.[0]?.value
        });
      } else {
        return res.send({
          name: req.user.displayName,
          email: req.user.emails?.[0]?.value,
          photo: req.user.photos?.[0]?.value
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }
  });
  


app.post('/auth/userinfo', async (req, res) => {
if (!req.user) return res.status(401).send('Not logged in');

const { firstName, lastName, primaryContact, secondaryContact, address, secondaryEmail } = req.body;

try {
    const googleId = req.user.id;
    await pool.query(
    `UPDATE users SET first_name=$1, last_name=$2, primary_contact=$3, secondary_contact=$4, address=$5, secondary_email=$6 WHERE google_id=$7`,
    [firstName, lastName, primaryContact, secondaryContact, address, secondaryEmail, googleId]
    );
    res.send({ success: true });
} catch (err) {
    console.error('Error saving user info:', err);
    res.status(500).send('Error saving info');
}
});

app.get('/auth/check', (req, res) => {
    res.send({ user: req.user || null, session: req.session });
  });


app.get('/packages', async (req, res) => {
try {
    const result = await pool.query('SELECT * FROM packages');
    res.send(result.rows);
} catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).send('Server error');
}
});
  
// Get single package
app.get('/packages/:id', async (req, res) => {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM packages WHERE id=$1', [id]);
    res.send(result.rows[0]);
  });
  
  // Get package details
  app.get('/packages/:id/details', async (req, res) => {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM package_details WHERE package_id=$1', [id]);
    res.send(result.rows[0]);
  });

const bookingRoutes = require('./routes/bookings');
app.use('/bookings', bookingRoutes);

app.get('/homepage/packages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, image_url, description, cost_per_person 
      FROM packages 
      ORDER BY start_date ASC 
      LIMIT 3
    `);
    res.send(result.rows);
  } catch (err) {
    console.error('Error fetching homepage packages:', err);
    res.status(500).send('Server error');
  }
});

  
module.exports = app;