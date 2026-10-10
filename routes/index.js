const router = require('express').Router();
const passport = require('passport');
const { isAuthenticated } = require('../middleware/authenticate');

const githubLogin = passport.authenticate('github', { scope: ['user:email'] });

router.get(
  '/auth/github',
  /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'Sign in with GitHub'
    #swagger.description = 'Open this link in a browser to start GitHub OAuth. Do not use Swagger Execute; after login, return to the API Docs tab.'
    #swagger.responses[302] = {
      description: 'Redirects the browser to GitHub for authentication'
    }
    #swagger.responses[500] = {
      description: 'Authentication could not be started'
    }
  */
  githubLogin
);

router.get('/login', githubLogin);

// GitHub Callback endpoint
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to API Docs upon successful login
    res.redirect('/api-docs');
  }
);

// Logout Route
router.get(
  '/logout',
  /*
    #swagger.tags = ['Authentication']
    #swagger.summary = 'Log out'
    #swagger.description = 'Open this link in a browser to end the current session. Do not use Swagger Execute; the browser redirects to API Docs after logout.'
    #swagger.responses[302] = {
      description: 'Session ended and browser redirected to API Docs'
    }
    #swagger.responses[500] = {
      description: 'Logout failed'
    }
  */
  (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/api-docs');
    });
  }
);

// Check Current Login Status
router.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;