var should = require('should');
var create = require('..');

var resources = {
  '/': {
    users: {
      href: '/users'
    }
  },
  '/users': {
    collection: [
      {
        href: '/users/123'
      },
      {
        href: '/users/456'
      },
      {
        href: '/users/789'
      }
    ]
  },
  '/users/123': {
    name: 'Mike',
    image: {
      thumbnail: {
        src: 'mike-profile.png'
      }
    }
  },
  '/users/456': {
    name: 'Joe',
    image: {
      thumbnail: {
        src: 'joe-profile.png'
      }
    }
  },
  '/users/789': {
    name: 'Robert',
    image: {
      thumbnail: {
        src: 'robert-profile.png'
      }
    }
  }
};

var client = {
  root: function(cb) {
    return client.get('/', cb);
  },
  get: function(path, cb) {
    setTimeout(function() {
      cb(null, resources[path]);
    }, 0);
  }
};

function test (input, scope, expected) {
  return function(done) {
    create(input, client)(scope, {}, function(err, actual) {
      should.not.exist(err);
      should.exist(actual);
      actual.should.eql(expected);
      done();
    });
  };
}

describe('hyper-template', function() {
  it('should render a simple template', test(
    {
      user: {
        name: '@',
        image: '@.thumbnail.src'
      }
    }, {
      user: {
        href: '/users/123'
      }
    }, {
      user: {
        name: 'Mike',
        image: 'mike-profile.png'
      }
    }
  ));

  it('should render a deep template', test(
    {
      user: {
        foo: {
          bar: {
            baz: 'user.name'
          }
        }
      }
    }, {
      user: {
        href: '/users/123'
      }
    }, {
      user: {
        foo: {
          bar: {
            baz: 'Mike'
          }
        }
      }
    }
  ));

  it('should start from the root', test(
    {
      user: {
        name: '.users.1.name'
      }
    }, {}, {
      user: {
        name: 'Joe'
      }
    }
  ));

  it('should render arrays', test(
    {
      users: [
        '.@.name',
        '.@.name',
        '.@.name'
      ]
    }, {}, {
      users: [
        'Mike',
        'Joe',
        'Robert'
      ]
    }
  ));

  it('should traverse hyper collections', test(
    {
      users: [
        '@.name',
        '@.name',
        '@.name'
      ]
    }, {
      users: {
        href: '/users'
      }
    }, {
      users: [
        'Mike',
        'Joe',
        'Robert'
      ]
    }
  ));
});
