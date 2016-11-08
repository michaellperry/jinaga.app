# Jinaga App

The simplest way to build a collaborative web app.

## What You Get

**Real-time collaboration**. After you follow these steps, you will have a web app that lets your users collaborate in real-time with one another. Changes made by one user in their browser will appear in other user's browsers instantly. Think real-time chat. For your whole application model.

**Persistence**. The app will also persist that data to MongoDB. You don't have to write any code to do that. You don't have to talk to the MongoDB API at all.

**Security**. Your app will be secure. Users will log in using their Google account. You can have some parts of your app open to the public, and other parts that require a login.

**Universal back end**. All of your application code will run on the client. Once the back end is up and running, you won't need to touch it again.

### Saving data

To save something, you will record a Jinaga fact. A fact is a JSON document. By convention, you provide a `type` property to indicate what the document means.

```JavaScript
var userGroup = {
  type: 'MyApp.UserGroup',
  identifier: 'papersdallas'
};
j.fact(userGroup);
```

### Querying data

To query data, you will write a template function. A template function matches facts with a certain set of properties:

```JavaScript
function meetingsInUserGroup(g) {
  return {
    type: 'MyApp.Meeting',
    userGroup: g
  };
}
```

### Collections

Then you will create a Collection for the child objects.

```JavaScript
function UserGroupViewModel(userGroup) {
  this.meetings = new jko.Collection(userGroup, [meetingsInUserGroup], MeetingViewModel);
  var meetingsWatch = this.meetings.watch();
}
```

A view model will be added to the collection whever a fact is created. This could happen when it's loaded from the MongoDB storage, when the user on this browser adds a child, or when a user on another browser adds a child. Bind to the view models in Knockout JS.

### Mutable properties

Programming with facts is very different from programming with properties. But you can simulate properties using facts. Create a Mutable in the child view model:

```JavaScript
function MeetingViewModel(meeting, vm) {
  this.title = new jko.Mutable('MyApp.Meeting.Title', meeting, '(new meeting)');
}
```

Watch for changes to that mutable property.

```JavaScript
  // In the UserGroupViewModel
  jko.watchMutable(meetingsWatch, 'title', 'MyApp.Meeting.Title');
```

Capture the current value of a mutable property so you can data bind it to a modal.

```JavaScript
  var title = this.title.capture();
```

And then when the user saves changes, just save.

```JavaScript
  title.save();
```

The property will be updated on this browser, and on all other browsers currently looking at the same object.

Continue on to [installing](installing.md)