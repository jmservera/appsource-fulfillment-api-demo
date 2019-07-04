
var passport = require('passport');
var oauthStrategy = require('passport-azure-ad-oauth2').Strategy;
var appConfig=require('/config.js');

module.exports.init = function(app, $users)
{

    var strategy = new oauthStrategy({
                        clientID: appConfig.clientID,      //app id
                        clientSecret: appConfig.clientSecret,   //your app key                    
                        callbackURL: appConfig.callbackURL,                                        
                    },function(accessToken, refresh_token, params, profile, done){
                        //decodes the token and sends the information to the user profile handler
                        var context = profile;
                        done(null, context);
                    });
}