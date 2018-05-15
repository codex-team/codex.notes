!function (o, e) {
  'object'==typeof exports&&'object'==typeof module?module.exports=e():'function'==typeof define&&define.amd?define([], e):'object'==typeof exports?exports.hawk=e():o.hawk=e();
}(this, function () {
  return function (o) {
    function e(t) {
      if(n[t])return n[t].exports;var r=n[t]={i:t, l:!1, exports:{}};

      return o[t].call(r.exports, r, r.exports, e), r.l=!0, r.exports;
    }var n={};

    return e.m=o, e.c=n, e.i=function (o) {
      return o;
    }, e.d=function (o, n, t) {
      e.o(o, n)||Object.defineProperty(o, n, {configurable:!1, enumerable:!0, get:t});
    }, e.n=function (o) {
      var n=o&&o.__esModule?function () {
        return o.default;
      }:function () {
        return o;
      };

      return e.d(n, 'a', n), n;
    }, e.o=function (o, e) {
      return Object.prototype.hasOwnProperty.call(o, e);
    }, e.p='', e(e.s=3);
  }([function (o, e, n) {
    'use strict';o.exports.log=function (o, e) {
      e=e||'info', o='[CodeX Hawk]: '+o, 'console'in window&&window.console[e]&&window.console[e](o);
    };
  }, function (o, e, n) {
    'use strict';/*!
 * Codex Hawk client side module
 * https://github.com/codex-team/hawk.client
 *
 * Codex Hawk - https://hawk.so
 * Codex Team - https://ifmo.su
 *
 * @license MIT (c) CodeX 2017
 */
    o.exports=function () {
      var o=n(2), e=n(4), t=n(0), r=null, c=void 0, i=function (n, i, u, f, l) {
            if(o.socket.host=i||o.socket.host, o.socket.port=u||o.socket.port, o.socket.path=f||o.socket.path, o.socket.secure=void 0!==l?l:o.socket.secure, !n)return void t.log('Please, pass your verification token for Hawk error tracker. You can get it on hawk.so', 'warn');c=n;var p=o.socket;

            p.onmessage=s.message, p.onclose=s.close, r=e(p), window.addEventListener('error', a);
          }, s={message:function (o) {
            var e=void 0, n=void 0;

            try{
              o=JSON.parse(o.data), n=o.type, e=o.message;
            }catch(t) {
              e=o.data, n='info';
            }t.log('Message from server: '+e, n);
          }, close:function () {
            t.log("Connection lost. Errors won't be save. Please, refresh the page", 'warn');
          }}, a=function (o) {
            var e={token:c, message:o.message, error_location:{file:o.filename, line:o.lineno, col:o.colno}, location:{url:window.location.href, origin:window.location.origin, host:window.location.hostname, path:window.location.pathname, port:window.location.port}, stack:o.error.stack||o.error.stacktrace, time:Date.now(), navigator:{ua:window.navigator.userAgent, frame:{width:window.innerWidth, height:window.innerHeight}}};

            r.send(e);
          };

      return{init:i, test:function () {
        a({message:'Hawk client catcher test', filename:'hawk.js', lineno:0, colno:0, error:{stack:'hawk.js'}});
      }};
    }();
  }, function (o, e, n) {
    'use strict';o.exports={socket:{host:'hawk.so', path:'catcher/client', port:8070, secure:!0}};
  }, function (o, e, n) {
    'use strict';o.exports=n(1);
  }, function (o, e, n) {
    'use strict';o.exports=function (o) {
      var e=null, t=n(0), r={CONNECTING:0, OPEN:1, CLOSING:2, CLOSED:3}, c=function () {
            return new Promise(function (n, t) {
              var r='ws'+(o.secure?'s':'')+'://', c=o.host||'localhost', i=o.path?'/'+o.path:'', s=o.port?':'+o.port:'', a=r+c+s+i;

              e=new WebSocket(a), 'function'==typeof o.onmessage&&(e.onmessage=o.onmessage), e.onclose=function (e) {
                'function'==typeof o.onclose&&o.onclose.call(this, e), t();
              }, e.onopen=function (e) {
                'function'==typeof o.onopen&&o.onopen.call(this, e), n();
              };
            });
          }, i=function o() {
            var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;

            return new Promise(function (n, r) {
              c().then(function () {
                t.log('Successfully reconnect to socket server', 'info'), n();
              }, function () {
                e>0?o(e-1).then(n, r):(t.log("Can't reconnect to socket server", 'warn'), r());
              }).catch(function (o) {
                t.log('Error while reconnecting to socket server', 'error');
              });
            });
          }, s=function (o) {
            null!==e&&(o=JSON.stringify(o), e.readyState!==r.OPEN?i().then(function () {
              e.send(o);
            }, function () {
              t.log("Can't send your data", 'warn');
            }):e.send(o));
          };

      return c().catch(function (o) {
        t.log('Error while opening socket connection', 'error');
      }), {send:s};
    };
  }]);
});
// # sourceMappingURL=hawk.js.map
