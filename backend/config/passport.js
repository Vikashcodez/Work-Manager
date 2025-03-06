const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
          user = await user.save(); // ✅ Ensure user is saved before returning
        }

        return done(null, user); // ✅ Always return the full `user` object
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// ✅ Fix: Serialize & Deserialize User Correctly
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user); // Debugging
  done(null, user._id); // ✅ Ensure `_id` is stored in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("Deserializing user:", user); // Debugging
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
