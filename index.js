var express=require('express');
const appconfig=require('./config.js');
const bodyParser=require('body-parser');

var app=express();
app.use(bodyParser.json({extended:true}));

var user=null;

app.get('/', function (req, res) {
    res.send('Hello World');
 })

app.get('/Onboarding/ProcessCode',function(req,res){
    if(user===null){
        
    }
})

app.get('/marketplacehook', function(req,res){
  console.log("Marketplacehook: "+ JSON.stringify(req));
})

app.post('/marketplacehook', function(req,res){
  console.log("Marketplacehook: "+ JSON.stringify(req.body));
  res.send('ok');
})

 var server = app.listen(appconfig.port, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port);
 })
/*

request.post(
  'https://login.microsoftonline.com/' + config.marketplaceTenantId + '/oauth2/token',
  {
    json: true,
    form: {
      grant_type: 'client_credentials',
      client_id: config.marketplaceClientId,
      client_secret: config.marketplaceClientSecret,
      resource: 'https://graph.windows.net'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  },
  (_e, _xhr, auth) => {
    // ...
    const authorizationToken = auth.token_type + ' ' + auth.access_token;
    request.get(
      'https://api.partnercenter.microsoft.com/v1/offers/', // + subscription.offerId,
      {
        json: true,
        qs: {
          country: 'ES'
        },
        headers: {
          Authorization: authorizationToken,
          'MS-Contract-Version': 'v1',
          'locale-id': 'en-US',
          'Content-Type': 'application/json'
        }
      },
	  (_e, _xhr, offer) => {
	    // error 401: unauthorized
	  }
    );
});
*/