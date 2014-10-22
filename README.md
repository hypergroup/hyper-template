hyper-template
==============

transform hyper+json data with a template

Installation
------------

```sh
$ npm install hyper-template
```

Usage
-----

```js
var create = require('hyper-template');

var template = create({
  user: {
    name: 'user.full-name',
    gender: '@', // aliases to user.gender
    address: 'concat(user.address.street, "\n", user.address.city, ", ", user.address.state, " ", user.address.zip)'
  }
});

template.def('concat', function() {
  return Array.prototype.join.call(arguments, '');
});

var scope = {
  user: {
    href: 'https://api.example.com/user/123'
  }
};

template(scope, function(err, res) {
  console.log(res); // {user: {name: 'Mike Smith', gender: 'male', address: '123 Fake St.\nNowhere, KS 12345'}}
});
```
