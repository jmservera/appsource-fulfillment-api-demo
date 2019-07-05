var config={
    PORT:8080,
    PC_APIVERSION:'api-version=2018-08-31',
    marketplaceTenantId:'your tenant id',
    marketplaceClientId:'your client id',
    marketplaceClientSecret:'your client secret',
    redirectUri:'your redirect'
};

config={...config, ...process.env};

module.exports=config;