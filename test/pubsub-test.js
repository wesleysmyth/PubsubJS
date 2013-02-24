var assert = require('assert')
  , PubSub = require('../pubsub.js');
  ;

describe('Pubsub', function () {
  describe('#publish', function () {
    describe('when registed one subscriber', function () {
      it('should call a subscriber given a arguments when gave #publish one argument', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context, a) {
          actual.a += a;
        });

        pubsub.publish('event', null, 1);
        assert.strictEqual(1, actual.a);
      });

      it('should call a subscriber given multiple arguments when gave #publish multiple arguments', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0, b: 0, c: 0}
          ;

        pubsub.subscribe('event', function (context, a, b, c) {
          actual.a += a;
          actual.b += b;
          actual.c += c;
        });

        pubsub.publish('event', null, 1, 2, 3);
        assert.strictEqual(1, actual.a);
        assert.strictEqual(2, actual.b);
        assert.strictEqual(3, actual.c);
      });
    });

    describe('when registed multiple subscriber', function () {
      it('should call subscribers given a arguments when gave #publish one argument', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context, a) {
          actual.a += a;
        });

        pubsub.subscribe('event', function (context, a) {
          actual.a += a;
        });

        pubsub.publish('event', null, 1);
        assert.strictEqual(2, actual.a);
      });

      it('should call subscribers given multiple arguments when gave #publish multiple arguments', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0, b: 0, c: 0}
          ;

        pubsub.subscribe('event', function (context, a, b, c) {
          actual.a += a;
          actual.b += b;
          actual.c += c;
        });

        pubsub.subscribe('event', function (context, a, b, c) {
          actual.a += a;
          actual.b += b;
          actual.c += c;
        });

        pubsub.publish('event', null, 1, 2, 3);
        assert.strictEqual(2, actual.a);
        assert.strictEqual(4, actual.b);
        assert.strictEqual(6, actual.c);
      });
    });
  });

  describe('#subscribe', function () {
    describe('when given globalContext', function () {
      it('should not be able to call pubsub#publish in the null pettern', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context && context.publish('event2', null, 1);
        });

        pubsub.subscribe('event2', function (context, a) {
          actual.a += a;
        });

        pubsub.publish('event', null, 1);
        assert.strictEqual(0, actual.a);
      });

      it('should be able to call pubsub#publish in the globalContext pettern', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context.publish('event2', null, 1);
        });

        pubsub.subscribe('event2', function (context, a) {
          actual.a += a;
        });

        pubsub.publish('event', pubsub.globalContext, 1);
        assert.strictEqual(1, actual.a);
      });

      it('should be able to call context#publish in the local context pettern', function () {
        var pubsub = PubSub.create()
          , localContext = pubsub.Context.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context.publish('event', null, 1);
        });

        localContext.subscribe('event', function (context, a) {
          actual.a += a;
        });

        pubsub.publish('event', localContext, 1);
        assert.strictEqual(1, actual.a);
      });
    });
  });

  describe('#unsubscribe', function () {
    describe('when only the event name is specified', function () {
      it('should canceled subscribers of the specified event', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          actual.a += 1;
        });

        pubsub.subscribe('event', function (context) {
          actual.a += 1;
        });

        pubsub.unsubscribe('event');
        pubsub.publish('event', null);
        assert.strictEqual(0, actual.a);
      });


      it('should canceled subscribers of the specified event in the local context pattern', function () {
        var pubsub = PubSub.create()
          , localContext = pubsub.Context.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context.publish('evented', null, 1);
        });

        localContext.subscribe('evented', a);
        localContext.subscribe('evented', b);
        localContext.unsubscribe('evented');

        function a(context) {
          actual.a += 1;
        }

        function b(context) {
          actual.a += 2;
        }

        pubsub.publish('event', localContext);
        assert.strictEqual(0, actual.a);
      });
    });

    describe('when bouth the event name and the subscriber are specified', function () {
      it('should canceled the applicable handler of the specified event', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', a);
        pubsub.subscribe('event', b);

        function a(context) {
          actual.a += 1;
        }

        function b(context) {
          actual.a += 2;
        }

        pubsub.unsubscribe('event', a);
        pubsub.publish('event', null);
        assert.strictEqual(2, actual.a);
      });

      it('should canceled the applicable handler of the specified event in the localContext pattern', function () {
        var pubsub = PubSub.create()
          , localContext = pubsub.Context.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context.publish('evented', null, 1);
        });

        localContext.subscribe('evented', a);
        localContext.subscribe('evented', b);
        localContext.unsubscribe('evented', a);

        function a(context) {
          actual.a += 1;
        }

        function b(context) {
          actual.a += 2;
        }

        pubsub.publish('event', localContext);
        assert.strictEqual(2, actual.a);
      });

      it('should canceled the applicable handlers of the specified event', function () {
        var pubsub = PubSub.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', a);
        pubsub.subscribe('event', b);
        pubsub.subscribe('event', a);

        function a(context) {
          actual.a += 1;
        }

        function b(context) {
          actual.a += 5;
        }

        pubsub.unsubscribe('event', a);
        pubsub.publish('event', null);
        assert.strictEqual(5, actual.a);
      });

      it('should canceled the applicable handlers of the specified event in the localContext pattern', function () {
        var pubsub = PubSub.create()
          , localContext = pubsub.Context.create()
          , actual = {a: 0}
          ;

        pubsub.subscribe('event', function (context) {
          context.publish('evented', null, 1);
        });

        localContext.subscribe('evented', a);
        localContext.subscribe('evented', b);
        localContext.subscribe('evented', a);
        localContext.unsubscribe('evented', a);

        function a(context) {
          actual.a += 1;
        }

        function b(context) {
          actual.a += 5;
        }

        pubsub.publish('event', localContext);
        assert.strictEqual(5, actual.a);
      });

      describe('when applicable handler does not exist', function () {
        it('should nothing is done', function () {
          var pubsub = PubSub.create()
            , actual = {a: 0}
            ;

          pubsub.subscribe('event', a);

          function a(context) {
            actual.a += 1;
          }

          function b(context) {
            actual.a += 2;
          }

          pubsub.unsubscribe('event', b);
          pubsub.publish('event', null);
          assert.strictEqual(1, actual.a);
        });

        it('should nothing is done in the localContext pattern', function () {
          var pubsub = PubSub.create()
            , localContext = pubsub.Context.create()
            , actual = {a: 0}
            ;

          pubsub.subscribe('event', function (context) {
            context.publish('evented', null, 1);
          });

          localContext.subscribe('evented', a);
          localContext.unsubscribe('evented', b);

          function a(context) {
            actual.a += 1;
          }

          function b(context) {
            actual.a += 5;
          }

          pubsub.publish('event', localContext);
          assert.strictEqual(1, actual.a);
        });
      });
    });
  });
});

