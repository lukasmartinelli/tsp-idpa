// Generated by CoffeeScript 1.3.3

/**
* @preserve Simrou v1.5.4 - Released under the MIT License.
* Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
*/


(function() {
  var Route, Simrou,
    __bind = function(fn, me){ return function(){ return fn.apply(me, 
arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  Simrou = (function() {

    Simrou.prototype.RegExpCache = {
      extractHash: /^[^#]*(#.*)$/,
      trimHash: /^#*(.*?)\/*$/
    };

    Simrou.prototype.eventSupported = (function() {
      var docMode;
      docMode = window.document.documentMode;
      return 'onhashchange' in window && (!(docMode != null) || docMode > 7);
    })();

    function Simrou(initialRoutes) {
      this.handleFormSubmit = __bind(this.handleFormSubmit, this);

      this.resolveHash = __bind(this.resolveHash, this);
      this.routes = {};
      this.listening = false;
      this.observeHash = false;
      this.observeForms = false;
      if (initialRoutes != null) {
        this.addRoutes(initialRoutes);
      }
      if (this.initialize != null) {
        this.initialize();
      }
    }

    Simrou.prototype.addRoute = function(pattern, caseSensitive) {
      var route;
      if (caseSensitive == null) {
        caseSensitive = true;
      }
      route = pattern instanceof Route ? pattern : new Route(pattern, 
caseSensitive);
      return this.routes[route.toString()] = route;
    };

    Simrou.prototype.addRoutes = function(routes, caseSensitive) {
      var actions, list, pattern, route, _i, _len;
      if (caseSensitive == null) {
        caseSensitive = true;
      }
      if (jQuery.isFunction(routes)) {
        list = routes.call(this, caseSensitive);
      } else if (jQuery.isArray(routes)) {
        list = [];
        for (_i = 0, _len = routes.length; _i < _len; _i++) {
          route = routes[_i];
          list.push(this.addRoutes(route, caseSensitive));
        }
      } else if (jQuery.isPlainObject(routes)) {
        list = {};
        for (pattern in routes) {
          if (!__hasProp.call(routes, pattern)) continue;
          actions = routes[pattern];
          route = this.addRoute(pattern, caseSensitive);
          route.attachActions(actions);
          list[pattern] = route;
        }
      } else {
        list = this.addRoute(routes, caseSensitive);
      }
      return list;
    };

    Simrou.prototype.removeRoute = function(route) {
      var name;
      if (!(route instanceof Route)) {
        route = new Route(route);
      }
      name = route.toString();
      if (name in this.routes) {
        return delete this.routes[name];
      }
    };

    Simrou.prototype.navigate = function(hash) {
      var previousHash;
      previousHash = this.getHash();
      location.hash = hash;
      if (!this.observeHash || location.hash === previousHash) {
        return this.resolve(hash, 'get');
      }
    };

    Simrou.prototype.resolve = function(hash, method) {
      var $route, args, cleanHash, name, params, route, _ref;
      cleanHash = String(hash).replace(this.RegExpCache.trimHash, '$1');
      if (cleanHash === '') {
        if (String(hash).indexOf('/') === -1) {
          return false;
        } else {
          cleanHash = '/';
        }
      }
      _ref = this.routes;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        route = _ref[name];
        if (!(route instanceof Route)) {
          continue;
        }
        params = route.match(cleanHash);
        if (!params) {
          continue;
        }
        args = [params, method];
        $route = jQuery(route);
        $route.trigger('simrou:any', args);
        if ((method != null) && method !== 'any') {
          $route.trigger('simrou:' + method.toLowerCase(), args);
        }
        return true;
      }
      return false;
    };

    Simrou.prototype.getHash = function(url) {
      if (url == null) {
        url = location.hash;
      }
      return String(url).replace(this.RegExpCache.extractHash, '$1');
    };

    Simrou.prototype.resolveHash = function(event) {
      var hash, url;
      if (this.observeHash) {
        if (this.eventSupported) {
          url = event.originalEvent.newURL;
        }
        hash = this.getHash(url);
        return this.resolve(hash, 'get');
      }
    };

    Simrou.prototype.handleFormSubmit = function(event) {
      var $form, action, method;
      if (this.observeForms) {
        $form = jQuery(event.target);
        method = $form.attr('method') || $form.get(0).getAttribute('method');
        action = this.getHash($form.attr('action'));
        if (this.resolve(action, method)) {
          event.preventDefault();
        }
      }
      return true;
    };

    Simrou.prototype.listen = function() {
      var _this = this;
      if (!this.listening) {
        jQuery(window).on('hashchange.simrou', this.resolveHash);
        jQuery(function() {
          return jQuery('body').on('submit.simrou', 'form', 
_this.handleFormSubmit);
        });
        return this.listening = true;
      }
    };

    Simrou.prototype.start = function(initialHash, observeHash, observeForms) 
{
      var hash;
      this.observeHash = observeHash != null ? observeHash : true;
      this.observeForms = observeForms != null ? observeForms : true;
      if (this.observeHash || this.observeForms) {
        this.listen();
      }
      hash = this.getHash();
      if (hash !== '') {
        return this.resolve(hash, 'get');
      } else if (initialHash != null) {
        if ((window.history != null) && (window.history.replaceState != null)) 
{
          window.history.replaceState({}, document.title, '#' + 
initialHash.replace(/^#+/, ''));
          return this.resolve(initialHash, 'get');
        } else {
          return this.navigate(initialHash);
        }
      }
    };

    Simrou.prototype.stop = function() {
      this.observeHash = false;
      return this.observeForms = false;
    };

    return Simrou;

  })();

  Route = (function() {
    var shortcut;

    Route.prototype.RegExpCache = {
      escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
      namedParam: /:(\w+)/g,
      splatParam: /\*(\w+)/g,
      firstParam: /(:\w+)|(\*\w+)/,
      allParams: /(:|\*)\w+/g
    };

    function Route(pattern, caseSensitive) {
      var flags, name, names;
      this.pattern = pattern;
      this.caseSensitive = caseSensitive != null ? caseSensitive : true;
      pattern = String(this.pattern);
      names = pattern.match(this.RegExpCache.allParams);
      if (names != null) {
        this.params = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(name.substr(1));
          }
          return _results;
        })();
      } else {
        this.params = [];
      }
      pattern = pattern.replace(this.RegExpCache.escapeRegExp, '\\$&');
      pattern = pattern.replace(this.RegExpCache.namedParam, '([^\/]+)');
      pattern = pattern.replace(this.RegExpCache.splatParam, '(.+?)');
      flags = caseSensitive ? '' : 'i';
      this.expr = new RegExp('^' + pattern + '$', flags);
    }

    Route.prototype.match = function(hash) {
      var index, matches, name, result, _i, _len, _ref;
      matches = this.expr.exec(hash);
      if (jQuery.isArray(matches)) {
        result = {};
        _ref = this.params;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          result[name] = matches[index + 1];
        }
      } else {
        result = false;
      }
      return result;
    };

    Route.prototype.assemble = function() {
      var name, url, value, values;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (values.length > 0) {
        if (jQuery.isArray(values[0])) {
          values = values[0];
        } else if (jQuery.isPlainObject(values[0])) {
          values = (function() {
            var _i, _len, _ref, _results;
            _ref = this.params;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              name = _ref[_i];
              _results.push(name in values[0] ? values[0][name] : '');
            }
            return _results;
          }).call(this);
        }
      }
      url = String(this.pattern);
      while (this.RegExpCache.firstParam.test(url)) {
        value = values.length > 0 ? values.shift() : '';
        if (jQuery.isFunction(value)) {
          value = value(this);
        }
        url = url.replace(this.RegExpCache.firstParam, String(value));
      }
      return url;
    };

    Route.prototype.toString = function() {
      return String(this.pattern);
    };

    Route.prototype.attachAction = function(action, method) {
      if (method == null) {
        method = 'any';
      }
      jQuery(this).on('simrou:' + method.toLowerCase(), action);
      return this;
    };

    Route.prototype.attachActions = function(actions, method) {
      var action, list, tmp, _i, _len, _ref;
      if (method == null) {
        method = 'any';
      }
      if (!jQuery.isPlainObject(actions)) {
        _ref = [{}, actions], actions = _ref[0], tmp = _ref[1];
        actions[method] = tmp;
      }
      for (method in actions) {
        if (!__hasProp.call(actions, method)) continue;
        list = actions[method];
        if (!jQuery.isArray(list)) {
          list = [list];
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          action = list[_i];
          this.attachAction(action, method);
        }
      }
      return this;
    };

    Route.prototype.detachAction = function(action, method) {
      var eventName;
      if (method == null) {
        method = 'any';
      }
      if (typeof action === 'string') {
        method = action;
      }
      eventName = 'simrou:' + method.toLowerCase();
      if (jQuery.isFunction(action)) {
        jQuery(this).off(eventName, action);
      } else {
        jQuery(this).off(eventName);
      }
      return this;
    };

    shortcut = function(method) {
      return function(action) {
        return this.attachAction(action, method);
      };
    };

    Route.prototype.get = shortcut('get');

    Route.prototype.post = shortcut('post');

    Route.prototype.put = shortcut('put');

    Route.prototype["delete"] = shortcut('delete');

    Route.prototype.any = shortcut('any');

    return Route;

  })();

  Simrou.Route = Route;

  window.Simrou = jQuery.Simrou = Simrou;

}).call(this);

