# Jinaga App

The simplest way to build a collaborative web app.

## What You Get

After you follow these steps, you will have a web app that lets your users collaborate
in real-time with one another. Changes made by one user in their browser will appear
in other user's browsers instantly. Think real-time chat. Now let your imagination run
from there.

The app will also persist that data to MongoDB. You don't have to write any code to do
that. You don't have to talk to the MongoDB API at all.

Your app will be secure. Users will log in using their Google account. You can have some
parts of your app open to the public, and other parts that require a login.

All of your application code will run on the client. Once the back end is up and running,
you won't need to touch it again.

### Saving data

To save something, you will record a Jinaga fact. A fact is a JSON document. By convention,
you provide a `type` property to indicate what the document means.

```JavaScript
var group = {
    type: 'MyApp.UserGroup',
    name: 'Papers We Love'
};
j.fact(group);

j.fact({
    type: 'MyApp.Meeting',
    group: group,
    topic: 'Time, Clocks, and the Ordering of Events in a Distributed System',
    date: new Date(2016, 9, 15)
})
```

### Querying data

To query data, you will write a template function. A template function matches facts
with a certain set of properties:

```JavaScript
function meetingsInGroup(g) {
    return {
        type: 'MyApp.Meeting',
        group: g
    };
}
```

Then you will create a Jinaga watch. A watch looks for facts matching a template
from a specified starting point.

```JavaScript
j.watch(group, [meetingsInGroup], addMeeting, removeMeeting);

function addMeeting(meeting) {
    var meetingViewModel = new MeetingViewModel(meeting);

    // Add the meeting view model to the main view model.

    return meetingViewModel;
}

function removeMeeting(meetingViewModel) {
    // Remove the meeting view model from the main view model.
}
```

The functions will be called whever a fact is added or removed. This could happen
when it's loaded from the MongoDB storage, when the user on this browser does something,
or when a user on another browser does something.

## Get Started

Create a new folder for your app and follow these steps.

### Prerequisites

You will set up a back end in Node using MongoDB for storage and Google OAuth2 for
authentication. So you will need Node and MongoDB installed, and you will need to
sign up for a [Google Developers account](https://developers.google.com/identity/sign-in/web/devconsole-project).

Set up your folder. Initialize NPM and answer all of its questions. Change "index.js"
to "server.js". This will create a package.json file.

```
npm init
```

And then initialize Bower. This is how you will pull down the client side packages.

```
npm install --save bower
bower init
```

Answer all of the questions. This will create a bower.json file.

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

Create a file called `server.js`. This name should match the `main` setting in
your `package.json`. Enter this code:

```JavaScript
var app = require('jinaga.app');

app.start(__dirname);
```

### Config.js

The app loads its configuration from a file called `config/config.js`. The config file
will contain application secrets. Never ever check it in to your
repository. Add the rule to `.gitignore`:

```
config/config.js
```

Now, create the `config` directory and `config.js`. Enter this code:

```JavaScript
module.exports = {
    baseUrl: 'http://localhost:8080',
    google: {
        clientId: 'xxx',
        clientSecret: 'yyy'
    },
    mongoDB: 'mongodb://localhost:27017/dev'
};
```

Log on to the [Google Developer](https://console.developers.google.com/apis/credentials)
site in order to get your `clientId` and `clientSecret`. If you don't want to secure
your app yet, then you can leave it as xxx and yyy for now.

To set up your application, add an authorized JavaScript origin from
http://localhost:8080, and an authorized redirect URI to
http://localhost:8080/loginGoogle/callback.

Now start the app by running `node server`, and test it by going to http://localhost:8080/status.

### Content folders

Create a couple of folders: `public` and `private`. These will contain your site's
content. The public folder will not require authentication, but the private folder will.
Create an `index.html` file in the public folder, which will be the root of your site.

Use your favorite CSS framework to create a shell page at `index.html`:

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
        <script src="/config.js"></script>
        <script src="/public/myapp.js"></script>

        <script>
            $(document).foundation();
            ko.applyBindings(new MainViewModel());
        </script>
    </body>
</html>
```

Notice the `/config.js`. That's a server-generated file that gives the client-side
components their configuration.

### View model

Finally, create a file for your application in the public folder called `myapp.js` (or
whatever). This is the last file that your page loads. For now, just create a view model:

```JavaScript
function MainViewModel() {
    this.message = ko.observable('It works!');
}
```

Start the app again (`node server`), and test it by going to http://localhost:8080.
