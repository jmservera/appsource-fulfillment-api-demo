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
          'resource':'62d94f6c-d599-489b-a797-3e10e42fbe22',
          'Client_id':appconfig.marketplaceClientId,
          'client_secret':appconfig.marketplaceClientSecret
        }},
          function(err,res,body){
            if(!err){
              const jsonBody= JSON.parse(body);
              bearer=`bearer ${jsonBody.access_token}`;
            }
            callback(bearer,err);
          });
      }
      else{
        callback(bearer,null);
      }
  };
}();

function resolve(res, token, callback){
  getAuth(function(bearer, authError){
    const reqid=uuid.v1();
    const corrid=uuid.v1();
    const options={
      headers:{
        'x-ms-requestid':reqid,
        'x-ms-correlationid':corrid,
        'authorization':bearer,
        'x-ms-marketplace-token':token
      }
    }
    request.post(resolveApi,
      options,
      function(error, response, body){
        if(response.statusCode===200){
          const result=JSON.parse(body);
          callback(result,bearer);
        }
        else{
          res.write(body);
          res.write(`Original x-ms-requestid:${reqid}\n`);

          res.write(`Response headers:\n\t${JSON.stringify(response.headers)}\n`);
          res.write(`Status: ${response.statusCode}\n`);
          res.end();
      }
    });
    console.log(token);
  });
}

const resolveApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/resolve?${appconfig.PC_APIVERSION}`;

app.get('/', function (req, res) {
  const token=req.query.token;
  if(token){
    resolve(res,token, function(result,bearer){
        res.write("<html><body>");
        res.write(`<b>Subscription</b>: ${result.subscriptionName}<br><b>id</b>: ${result.id}`);
        res.write("<br>");
        res.write(`<b>Offer</b>: ${result.offerId}<br><b>plan</b>: ${result.planId}<br><b>quantity</b>: ${result.quantity}`)
        res.write("<br>");
        res.write("Activating subscription");
        res.flushHeaders();

        const activateApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}/activate?${appconfig.PC_APIVERSION}`;
        const reqid=uuid.v1();
        const corrid=uuid.v1();

        request.post(activateApi,
          {
            'headers':{
              'authorization':bearer,
              'x-ms-requestid':reqid,
              'x-ms-correlationid':corrid
            },
            'json':{
              'planId':result.planId,
              'quantity':result.quantity
            }
          },function(activateErr,activateResponse,activateBody){
              if(activateResponse.statusCode===200){
                res.write("-Activated!");
      
                res.write(`<form action="/changePlan?token=${encodeURIComponent(token)}" method="get"><input type="hidden" id="token" name="token" value="${token}"><input type="submit" value="change plan"></form>`);
              }
              res.write("</body></html>");
              res.end();
          });
      });
  }
 });

 app.get('/changePlan',function(req,res){
  const token=req.query.token;
  if(token){
    resolve(res,token, function(result,bearer){
      res.write("<html><body>");
        res.write(`<b>Subscription</b>: ${result.subscriptionName}<br><b>id</b>: ${result.id}`);
        res.write("<br>");
        res.write(`<b>Offer</b>: ${result.offerId}<br><b>plan</b>: ${result.planId}<br><b>quantity</b>: ${result.quantity}`)
        res.write("<br><b>Plans</b>:");

        const listPlansApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}/listAvailablePlans?${appconfig.PC_APIVERSION}`;
        const getSubscriptionApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}?${appconfig.PC_APIVERSION}`;

        const reqid=uuid.v1();
        const corrid=uuid.v1();

        request.get(listPlansApi,
          {
            'headers':{
              'authorization':bearer,
              'x-ms-requestid':reqid,
              'x-ms-correlationid':corrid,
              'Content-type':'application/json'
            }
          },function(listErr,listResponse,listBody){
 //           const plans= JSON.parse(listBody);
            res.write(JSON.stringify(listBody));// JSON.stringify(plans));
            res.write("</body></html>");
            res.end();
          });

    });
  }
 });

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