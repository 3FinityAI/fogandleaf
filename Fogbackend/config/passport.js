import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/users.model.js";

// Serialize/deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { provider: "google", providerId: profile.id },
        });

        if (!user) {
          user = await User.create({
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value || null,
            firstname: profile.name?.givenName || null,
            lastname: profile.name?.familyName || null,
            avatar: profile.photos?.[0]?.value || null,
          });
        }

        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { provider: "facebook", providerId: profile.id },
        });

        if (!user) {
          user = await User.create({
            provider: "facebook",
            providerId: profile.id,
            email: profile.emails?.[0]?.value || null,
            firstname: profile.name?.givenName || null,
            lastname: profile.name?.familyName || null,
            avatar: profile.photos?.[0]?.value || null,
          });
        }

        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
