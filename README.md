# appsource-fulfillment-api-demo

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=appsource-fulfillment-api-demo&metric=alert_status)](https://sonarcloud.io/dashboard?id=appsource-fulfillment-api-demo)

Just some demo code for the [SaaS Fulfillment APIs](https://docs.microsoft.com/en-us/azure/marketplace/partner-center-portal/pc-saas-fulfillment-apis)

Features implemented so far:

* Authorization Bearer
* Token resolve
* Change webhook (without code by now)

You need to [register your AAD application](https://docs.microsoft.com/en-us/azure/marketplace/partner-center-portal/pc-saas-registration) and provide
your Tenant ID, Client ID and Client Secret through the *config.js* file or via environment variables with the same name than the config fields.
