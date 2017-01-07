## Installing

Create a new folder for your app and follow these steps.

### Prerequisites

You will set up a back end in Node using MongoDB for storage and Google OAuth2 for authentication. So you will need Node and MongoDB installed, and you will need to sign up for a [Google Developers account](https://developers.google.com/identity/sign-in/web/devconsole-project).

Set up your folder. Initialize NPM and answer all of its questions. Change "index.js" to "server.js". This will create a package.json file.

```
npm init
```

And then initialize Bower. This is how you will pull down the client side packages.

```
npm install --save bower
bower init
```

Answer all of the questions. This will create a bower.json file.

If that command didn't work, then you might need to install Bower globally.

```
npm install -g bower
```

Furthermore, if you are using Windows, you might need to run this in a DOS shell rather than Bash. When you have Bower installed and initialized, you can install
the packages.

### Install packages

Install the Jinaga App packages.

```
npm install --save jinaga.app
bower install --save jinaga.app
```

Install your favorite CSS framework.

```
bower install --save foundation-sites
```

### Server.js

Create a file called `server.js`. This name should match the `main` setting in your `package.json`. Enter this code:

```JavaScript
var app = require('jinaga.app');

app.start(__dirname);
```

### Config.js

The app loads its configuration from a file called `config/config.js`. The config file will contain application secrets. Never ever check it in to your repository. Add the rule to `.gitignore`:

```
config/config.js
```

Now, create the `config` directory and `config.js`. Enter this code:

```JavaScript
module.exports = {
    baseUrl: 'http://localhost:8080',
    google: {
        clientId: 'xxx',
        clientSecret: 'yyy',
        loginUrl: '/loginGoogle',
        redirectUrl: '/loginGoogle/callback'
    },
    mongoDB: 'mongodb://localhost:27017/dev',
	secure: false
};
```

The `secure` setting controls whether the Jinaga connection uses TLS, so you'll want this to be false for development.

Log on to the [Google Developer](https://console.developers.google.com/apis/credentials) site in order to get your `clientId` and `clientSecret`. You may also set the values through the environment variables `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. If you don't want to secure your app yet, then you can leave it as xxx and yyy for now.

The `loginUrl` and `redirectUrl` parameters are optional. If you would like to customize those URLs, you may do so. Otherwise, the defaults are the values you see above. Values are relative to `baseUrl`. Configure the Google Developer Console to use the correct redirect URL. For example, if taking the defaults, add an authorized JavaScript origin from http://localhost:8080, and an authorized redirect URI to http://localhost:8080/loginGoogle/callback.

If you are using Active Directory instead, change your configuration to the following:

```JavaScript
module.exports = {
    baseUrl: 'http://localhost:8080',
    ad: {
        realm: 'http://mydomain',
        logoutUrl: '/logout',
        identityProviderUrl: 'https://login.windows.net/my-tenant-id/wsfed',
        identityMetadata: 'https://login.windows.net/my-tenant-id/federationmetadata/2007-06/federationmetadata.xml'
        loginUrl: '/loginAd',
        redirectUrl: '/loginAd/callback'
    },
    mongoDB: 'mongodb://localhost:27017/dev',
	secure: false
};
```

Again, the `loginUrl` and `redirectUrl` parameters are optional. If not specified, they will take the values shown above. You may also specify the values for AD using the environment variables `AD_REALM`, `AD_LOGOUT_URL`, `AD_IDENTITY_PROVIDER_URL`, and `AD_IDENTITY_METADATA`.

Now start the app by running:

```
DEBUG=jinaga.* node server
```

Test it by going to http://localhost:8080/status.

### Content folders

Create a couple of folders: `public` and `private`. These will contain your site's content. The public folder will not require authentication, but the private folder will. Create an `index.html` file in the public folder, which will be the root of your site.

Use your favorite CSS framework to create a shell page at `public/index.html`:

```html
<html>
    <head>
        <title>MyApp</title>
        <link rel="stylesheet" href="/bower_components/foundation-sites/dist/foundation.min.css">
    </head>
    <body>
        <h1>My App</h1>
        <p data-bind="text: message"></p>

        <script src="/bower_components/jquery/dist/jquery.min.js"></script>
        <script src="/bower_components/foundation-sites/dist/foundation.min.js"></script>
        <script src="/bower_components/knockout/dist/knockout.js"></script>
        <script src="/bower_components/jinaga/jinaga.js"></script>
        <script src="/bower_components/jinaga.app/jinaga.knockout.js"></script>
        <script src="/config.js"></script>
        <script src="/public/myapp.js"></script>

        <script>
            $(document).foundation();
            ko.applyBindings(new MainViewModel());
        </script>
    </body>
</html>
```

Notice the `/config.js`. That's a server-generated file that gives the client-side components their configuration.

### View model

Finally, create a file for your application in the public folder called `myapp.js`. This is the last file that your page loads. For now, just create a view model:

```JavaScript
function MainViewModel() {
    this.message = ko.observable('It works!');
}
```

Start the app again (`DEBUG=jinaga.* node server`), and test it by going to http://localhost:8080.

Continue on to build [Your First App](https://github.com/michaellperry/jinaga.app.client/blob/master/YourFirstApp.md).