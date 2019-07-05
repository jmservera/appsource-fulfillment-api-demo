const express=require('express');
const appconfig=require('./config.js');
const bodyParser=require('body-parser');
const request=require('request');
const uuid=require('uuid');

const app=express();
app.use(bodyParser.json({extended:true}));

var user=null;
var getAuth=function(){
  let bearer=null;
  return function(callback){
    //TODO: check for expired token
    if(!bearer){
        const loginUri=`https://login.microsoftonline.com/${appconfig.marketplaceTenantId}/oauth2/token`;
        request.get(loginUri,{form:{
          'Grant_type':'client_credentials',
          'Client_id':appconfig.marketplaceClientId,
          'client_secret':appconfig.marketplaceClientSecret
        }},
          function(err,res,body){
            if(!err){
              const jsonBody= JSON.parse(body);
              bearer=`Bearer ${jsonBody.access_token}`;
            }
            callback(bearer,err);
          });
      }
      else{
        callback(bearer,null);
      }
  };
}();

app.get('/', function (req, res) {
  const values=JSON.stringify(req.headers);
  if(req.query.token){
    getAuth(function(bearer, authError){
      const resolveApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/resolve?${appconfig.PC_APIVERSION}`;
      const reqid=uuid.v1();
      const corrid=uuid.v1();
      const options={
        json:'',
        headers:{
          'x-ms-requestid':reqid,
          'x-ms-correlationid':corrid,
          'authorization':bearer,
          'x-ms-marketplace-token':req.query.token
        }
      }
      request.post(resolveApi,
        options,
        function(error, response, body){
          console.log(body);
          res.send(`${values}\nok`);
      });
      console.log(req.query.token);
    });
  }
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

 var server = app.listen(appconfig.PORT, function () {
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