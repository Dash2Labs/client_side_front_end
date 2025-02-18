When onboarding new customers perform the following minimum checks:
- update customerSettings.json
- update Dockerfile
- update customer_setings.toml
- update ClientServer/constants.js and manually update ClientServer/constants.d.ts
- update Client/models/defaultsuggestions.ts
- update key cault with new server identiy (on name-zerver add dashe2labs server)
When adding new parameters, update all of the above as required:
- Additionally, update Client/constants.js and Client/constants.d.ts as required

In general, when adding new parameters that could vary by customer or deployment environment, using the configuration files.