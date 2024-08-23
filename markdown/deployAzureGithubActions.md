# Deploying .NET Web API and SQL Server to Azure using GitHub Actions

> ~10mins reading -
> 10/8/2024  

Deploying a .NET Web API to Azure and managing database migrations with EF Core can be a daunting task. However, with the power of GitHub Actions, we can automate and streamline this process. I'll walk you through the steps I took to deploy my 
.NET Web API and SQL Server database to Azure, and I'll share the challenges I faced and how I overcame them.


---

### Prerequisites
* .NET 6.0 Web API project
* Azure subscription
* GitHub repository


## - Step 1: Setting Up Azure Resources

Before diving into GitHub Actions, we need to set up our Azure environment.

> Create a Resource Group

1. Go to the Azure portal.
2. Navigate to Resource groups.
3. Click Add and create a new resource group named OmorusApp.
4. Select the East US region.
5. Create an App Service Plan

----

> Create an App Service Plan

1. In the Azure portal, navigate to App Service plans.
2. Click Add and create a new App Service plan named ASP-OmorusApp-9742.
3. Select the Free (F1) SKU.
4. Choose Windows as the operating system.
----



## - Step 2: Create the Web App
> Create the Web App
1. In the Azure portal, navigate to App Services.
2. Click Add and create a new Web App named in my example omorusApp.
2. Select the resource group OmorusApp.
3. Choose the App Service plan ASP-OmorusApp-something.
4. Select Code as the publishing model.
5. Choose .NET 6.0 as the runtime stack.
----


## - Step 3: Create an Azure SQL Server
1. In the Azure portal, navigate to SQL servers.
2. Click Add and fill in the following details:
3. Server name: omorus-db
4. Server admin login: ****
5. Password: Create a strong password and confirm it.
6. Location: Select East US.
7. Resource group: Select OmorusApp.
8. Click Review + create and then Create.
----

## - Step 4: Create an Azure SQL Database
Create the SQL Database
1. In the Azure portal, navigate to SQL databases.
2. Click Add and fill in the following details:
        Database name: Choose a name for your database.
        Server: Select omorus-db (the server created in the previous step).
        Elastic pool: Select No.
        Compute + storage: Choose the Basic pricing tier.
        Resource group: Select OmorusApp. ( in my example)
3. Click Review + create and then Create.
----


## - Step 5: Configure Connection Strings

Get the Connection String by copying it and inside navigate to your web app
1. Find configuration and specifically `Environment variables`
2. Click the  `Connection string`
3. Add a name and paste the connection string of sql server 
```code 
Server=tcp:omorus-db.database.windows.net,1433;Initial Catalog=YourDatabaseName;Persist Security Info=False;User ID=omorus;Password=YourPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

----


## - Step 6: Configure the Deployment Center
1. Configure GitHub Actions for Deployment
2. Navigate to the Deployment Center of your Web App (omorusApp).
3. Select GitHub as the source control provider.
4. Authenticate with GitHub and select the repository in my example https://github.com/kwnstantina/omorus.BE.
5. Choose the branch you want to deploy from (e.g., main).

Azure will automatically generate a GitHub Actions workflow file for your project.
----


## - Step 7: Set Up the GitHub Actions Workflow
1. Edit the Workflow File
2. Navigate to your GitHub repository.
3. Go to .github/workflows and find the generated workflow file (e.g., azure-webapps-deploy.yml).
4. Edit the workflow file to ensure it builds and deploys your .NET 6.0 Web API.

Example 

``` code 
  name: Build and deploy ASP.Net Core app to Azure Web App - omorusApp
  on:
    push:
      branches:
        - main
    workflow_dispatch:

  jobs:
    build:
      runs-on: windows-latest

      steps:
        - uses: actions/checkout@v2

        - name: Set up .NET Core
          uses: actions/setup-dotnet@v1
          with:
            dotnet-version: '6.0.x'
            include-prerelease: true
        
        - name: Restore NuGet packages
          run: dotnet restore

        - name: Build with dotnet
          run: dotnet build --configuration Release

        - name: Install EF Tool
          run: | 
               dotnet new tool-manifest --force
               dotnet tool install dotnet-ef 

        - name: dotnet publish
          run: dotnet publish -c Release -o ${{env.DOTNET_ROOT}}/myapp

        - name: Generate scripts
          run: dotnet ef migrations script --output ${{env.DOTNET_ROOT}}/sql/sql-script.sql --idempotent --context DataContext --project ./Omorus.DAL/Omorus.DAL.csproj
      
        - name: Azure SQL Deploy
          uses: azure/sql-action@v2.2
          with:
         # Name of the Azure SQL Server name, like Fabrikam.database.windows.net.
          #  server-name: tcp:omorus-db.database.windows.net
         # The connection string, including authentication information, for the Azure SQL Server database.
           connection-string: ${{ secrets.AZURE_SQL_CONNECTION_STRING}}
         # Path to SQL script file to deploy
          #  sql-file: ${{env.DOTNET_ROOT}}/sql/sql-script.sql
           path: ${{env.DOTNET_ROOT}}/sql/sql-script.sql
           action: 'publish'

        - name: Upload artifact for deployment job
          uses: actions/upload-artifact@v2
          with:
            name: .net-app
            path: ${{env.DOTNET_ROOT}}/myapp

    deploy:
      runs-on: windows-latest
      needs: build
      environment:
        name: 'Production'
        url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

      steps:
        - name: Download artifact from build job
          uses: actions/download-artifact@v2
          with:
            name: .net-app

        - name: Deploy to Azure Web App
          id: deploy-to-webapp
          uses: azure/webapps-deploy@v2
          with:
            app-name: 'omorusApp'
            slot-name: 'Production'
            publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_2D43451D175F48F6897B221D91C474BC }}
            package: .
            runtime-stack: 'dotnet|6.0'

```

### Explanation of the Workflow

> Trigger: The workflow triggers on pushes to the main branch or manual dispatch.
> Environment Variables: Set environment variables for the Azure Web App name, package path, and .NET version.
> Build Job:
  1. Check out the code.
  2. Set up .NET Core.
  3. Cache dependencies for faster builds.
  4. Build the application.
  5. Install EF Core tools.
  6. Publish the application.
  7. Generate EF Core migration scripts.
  8. Deploy the EF Core migration scripts to Azure SQL Database.
  9. Upload the published application as an artifact.
> Deploy Job:
1. Download the artifact.
2. Deploy the application to Azure Web App using the publish profile and runtime stack.

----



## - Step 8: Configure Secrets in GitHub
Add Azure Publish Profile
1. In the Azure portal, navigate to your Web App (omorusApp).
2. Go to Deployment Center > Manage Publish Profile and download the publish profile.
3. In your GitHub repository, go to Settings > Secrets and variables > Actions.
4. Click New repository secret and add a secret named AZURE_WEBAPP_PUBLISH_PROFILE,
AZURE_SQL_CONNECTION_STRING and 
AZUREAPPSERVICE_PUBLISHPROFILE_****
5. Paste the content of the publish profile into the secret value field.

----



## - Step 9- Running the Workflow
1. Commit and Push:
 Commit your changes and push to the main branch.
2. Monitor the Workflow:
Go to the Actions tab in your GitHub repository.
Monitor the build and deploy workflow to ensure it runs successfully.
----



### Conclusion
This setup automates the deployment of your .NET Web API and the application of EF Core migrations to Azure. By following these steps, you ensure a consistent and repeatable deployment process using GitHub Actions.


_Warning_ : This is a general approach, without so many details, in case of inconsistencies please contact me.


>>> Have a good one!





