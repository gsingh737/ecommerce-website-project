module.exports = {
  database: 'SET YOUR MONGODB URL',
  port: 8000,
  secretKey: 'Gurprets@$ss',
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'SET UR FACEBOOK CLIENT_ID',
    clientSecret: process.env.FACEBOOK_SECRET|| 'SET UR FACEBOOK CLIENT_SECRET',
    profileFields: ['emails', 'displayName'],
    callbackURL: 'http://localhost:8000/auth/facebook/callback'
  }
}
