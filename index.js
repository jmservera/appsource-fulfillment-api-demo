const express=require('express');
const appconfig=require('./config.js');
const bodyParser=require('body-parser');
const request=require('request-promise-native');
const uuid=require('uuid');

const app=express();
app.use(bodyParser.json({extended:true}));

var user=null;

/**
 * This function will get the client credentials needed for making api calls.
 * It is curryfied to allow multiple calls to the function if needed.
 * @returns {string} the authorization bearer 
 */
var getAuth=function(){
  let bearer=null;
  return async function(){
    //TODO: check for expired token
    if(!bearer){
        const loginUri=`https://login.microsoftonline.com/${appconfig.marketplaceTenantId}/oauth2/token`;
        const body=await request.get(loginUri,{form:{
          'Grant_type':'client_credentials',
          'resource':'62d94f6c-d599-489b-a797-3e10e42fbe22',
          'Client_id':appconfig.marketplaceClientId,
          'client_secret':appconfig.marketplaceClientSecret
        }})
        const jsonBody= JSON.parse(body);
        bearer= `bearer ${jsonBody.access_token}`;
    }
    return bearer;
  };
}();


/**
 * Resolves the subscription ID from the token
 * @param {string} token the token from the URL (like in ?token=....)
 * @param {string} bearer the authorization bearer from the getAuth function
*/
async function resolve(token, bearer){
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
    const response=await request.post(resolveApi, options);
    if(response){
      return JSON.parse(response);
    }
    console.log(token);
  }

const resolveApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/resolve?${appconfig.PC_APIVERSION}`;

async function activationFunction(req, res) {
  try{
    res.write("<html><body>");
    res.write("<h1>Fulfillment API Tests</h1>");

    const token=req.query.token;
    if(token){
      let bearer=await getAuth();
      const result=await resolve(token, bearer);
      res.write(`<b>Subscription</b>: ${result.subscriptionName}<br><b>id</b>: ${result.id}`);
      res.write("<br>");
      res.write(`<b>Offer</b>: ${result.offerId}<br><b>plan</b>: ${result.planId}<br><b>quantity</b>: ${result.quantity}`)
      res.write("<br>");
      res.write("Activating subscription");
      res.flushHeaders();
  
      const activateApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}/activate?${appconfig.PC_APIVERSION}`;
      const reqid=uuid.v1();
      const corrid=uuid.v1();
  
      const postResult=await request.post(activateApi,
            {
              'headers':{
                'authorization':bearer,
                'x-ms-requestid':reqid,
                'x-ms-correlationid':corrid
              },
              'json':{
                'planId':result.planId,
                'quantity':result.quantity
              },
              resolveWithFullResponse: true
            });
      if(postResult.statusCode===200)
      {
        res.write("-Activated!");
        res.write(`<form action="/changePlan?token=${encodeURIComponent(token)}" method="get"><input type="hidden" id="token" name="token" value="${token}"><input type="submit" value="change plan"></form>`);
      }
    }
    else{
      res.write("Call this page with a token to activate your subscription.");
      res.write("You can get it at the <a href='https://azuremarketplace.microsoft.com/en-us/marketplace/apps/jmservera.jmservera-demo-preview?tab=Overview&flightCodes=c03768aa-a77c-44ec-ab0a-34be1d0aa89b'> Azure Marketplace</a> or ");
      res.write("directly from the <a href='https://portal.azure.com/?microsoft_azure_marketplace_ItemHideKey=c03768aa-a77c-44ec-ab0a-34be1d0aa89b#create/jmservera.jmservera-demo-preview/preview'>Azure Portal</a>.")
    }
  } catch(err){
    console.error(err);
    res.write(err.message);
  }
  res.end("</body></html>");
 }

app.get('/', activationFunction);

 app.get('/changePlan',async function(req,res){
  res.write("<html><body>");
  try{
      const token=req.query.token;
      if(token){
        const bearer=await getAuth();
        const result=await resolve(token, bearer);
    
        res.write(`<b>Subscription</b>: ${result.subscriptionName}<br><b>id</b>: ${result.id}`);
        res.write("<br>");
        res.write(`<b>Offer</b>: ${result.offerId}<br><b>plan</b>: ${result.planId}<br><b>quantity</b>: ${result.quantity}`)
        res.write("<br><b>Plans</b>:");
    
        const listPlansApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}/listAvailablePlans?${appconfig.PC_APIVERSION}`;
        const getSubscriptionApi=`https://marketplaceapi.microsoft.com/api/saas/subscriptions/${result.id}?${appconfig.PC_APIVERSION}`;
    
        const reqid=uuid.v1();
        const corrid=uuid.v1();
    
        const listPlansResult=await request.get(listPlansApi,
        {
          'headers':{
            'authorization':bearer,
            'x-ms-requestid':reqid,
            'x-ms-correlationid':corrid,
            'Content-type':'application/json'
          }
        });
    
        //           const plans= JSON.parse(listBody);
        res.write(JSON.stringify(listPlansResult));// JSON.stringify(plans));

      }
   } catch (err){
     console.error(err);
     res.write(err.message);
   }
   res.end("</body></html>");
 });

app.get('/Onboarding/ProcessCode', activationFunction);

app.get('/marketplacehook', function(req,res){
  console.log("Marketplacehook: "+ JSON.stringify(req));
})

app.post('/marketplacehook', function(req,res){
  console.log("Marketplacehook: "+ JSON.stringify(req.body));
  res.send('ok');
})

 const server = app.listen(appconfig.PORT, function () {
    const host = server.address().address
    const port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port);
 });