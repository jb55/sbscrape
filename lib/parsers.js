// Generated by CoffeeScript 1.6.2
(function() {
  var debug, findModule, lazy, ok, parsers, _;

  debug = require('debug')('sbscrape:parsers');

  lazy = require('lazy-string');

  parsers = module.exports;

  _ = require('underscore')._;

  parsers.delta = function(str) {
    var num, start;

    start = str != null ? str[0] : void 0;
    num = _(str != null ? str.slice(1) : void 0).reject(function(x) {
      return x === ',';
    }).join("");
    switch (start) {
      case '+':
        return +num;
      case '-':
        return -num;
      default:
        return 0;
    }
  };

  parsers.average = function(td) {
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

    return {
      average: parsers.delta(td != null ? (_ref = td.children) != null ? (_ref1 = _ref[0]) != null ? (_ref2 = _ref1.children) != null ? (_ref3 = _ref2[0]) != null ? _ref3.data : void 0 : void 0 : void 0 : void 0 : void 0),
      total: parsers.delta(td != null ? (_ref4 = td.children) != null ? (_ref5 = _ref4[2]) != null ? (_ref6 = _ref5.children) != null ? (_ref7 = _ref6[0]) != null ? _ref7.data : void 0 : void 0 : void 0 : void 0 : void 0)
    };
  };

  parsers.summary = function(tds) {
    return {
      subscribers: parsers.average(tds != null ? tds[1] : void 0),
      contacts: parsers.average(tds != null ? tds[4] : void 0),
      views: {
        video: parsers.average(tds != null ? tds[2] : void 0),
        channel: parsers.average(tds != null ? tds[3] : void 0)
      }
    };
  };

  parsers.date = function(datestring) {
    var x;

    x = datestring.replace(/&nbsp;.*/, "");
    return x.replace(/\s/, "");
  };

  parsers.number = function(n) {
    return +(n != null ? n.replace(/[, ]/g, "") : void 0);
  };

  parsers.integer = function(n) {
    n = parsers.number(n);
    if (n < 0) {
      return 0;
    } else {
      return n;
    }
  };

  parsers.change = function(tds) {
    var _ref, _ref1, _ref2, _ref3;

    return {
      date: parsers.date(tds != null ? (_ref = tds[0]) != null ? (_ref1 = _ref.children) != null ? _ref1[0].data : void 0 : void 0 : void 0),
      total: parsers.number(tds != null ? (_ref2 = tds[2]) != null ? (_ref3 = _ref2.children) != null ? _ref3[0].data : void 0 : void 0 : void 0)
    };
  };

  findModule = function(modules, name) {
    var module, re, _ref, _ref1, _ref2, _ref3;

    re = new RegExp(name, "i");
    module = _(modules).find(function(module, ind) {
      var label, _ref, _ref1, _ref2, _ref3;

      label = module != null ? (_ref = module.children) != null ? (_ref1 = _ref[1]) != null ? (_ref2 = _ref1.children) != null ? (_ref3 = _ref2[0]) != null ? _ref3.data : void 0 : void 0 : void 0 : void 0 : void 0;
      if (re.test(label)) {
        return true;
      }
      return false;
    });
    return module != null ? (_ref = module.children) != null ? (_ref1 = _ref[3]) != null ? (_ref2 = _ref1.children) != null ? (_ref3 = _ref2[0]) != null ? _ref3.data : void 0 : void 0 : void 0 : void 0 : void 0;
  };

  parsers.page = function(o) {
    var averageInfo, modules, number, subInfo, summary, totalSubscribers, totalViews, userInfo, viewInfo, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;

    userInfo = (_ref = o("#UserInformation")) != null ? _ref[0] : void 0;
    summary = o("#SummaryWrap div p span");
    viewInfo = userInfo != null ? (_ref1 = userInfo.children) != null ? (_ref2 = _ref1[4]) != null ? _ref2.data : void 0 : void 0 : void 0;
    subInfo = userInfo != null ? (_ref3 = userInfo.children) != null ? (_ref4 = _ref3[6]) != null ? _ref4.data : void 0 : void 0 : void 0;
    averageInfo = function(n) {
      var _ref5, _ref6, _ref7;

      return summary != null ? (_ref5 = summary[n]) != null ? (_ref6 = _ref5.children) != null ? (_ref7 = _ref6[0]) != null ? _ref7.data : void 0 : void 0 : void 0 : void 0;
    };
    modules = o(".stats-top-data-module");
    totalSubscribers = findModule(modules, "subscribers");
    totalViews = findModule(modules, "video views");
    debug(parsers.number(totalViews));
    number = /-?[\d,]+/;
    return {
      summary: {
        subscribers: {
          total: parsers.number(totalSubscribers),
          average: parsers.number((_ref5 = averageInfo(3)) != null ? (_ref6 = _ref5.match(number)) != null ? _ref6[0] : void 0 : void 0)
        },
        views: {
          total: parsers.number(totalViews),
          average: parsers.integer((_ref7 = averageInfo(1)) != null ? (_ref8 = _ref7.match(number)) != null ? _ref8[0] : void 0 : void 0)
        }
      }
    };
  };

  parsers.changes = function(table) {
    var averageTds, change, entries, rows, _ref;

    rows = (table != null ? table.children : void 0) || [];
    averageTds = (_ref = _.last(rows)) != null ? _ref.children : void 0;
    entries = rows.slice(3, -1);
    change = _.compose(parsers.change, (function(tr) {
      return tr != null ? tr.children : void 0;
    }));
    return {
      entries: entries.map(change),
      summary: parsers.summary(averageTds)
    };
  };

  parsers.claimedBy = function(as) {
    var _ref, _ref1, _ref2, _ref3;

    if (((_ref = as[2]) != null ? (_ref1 = _ref.children[0]) != null ? _ref1.raw : void 0 : void 0) === "Network/Claimed By:") {
      return (_ref2 = as[3]) != null ? (_ref3 = _ref2.children[0]) != null ? _ref3.raw : void 0 : void 0;
    }
    return "";
  };

  parsers.isYtPartner = function(h3) {
    var _ref;

    return (_ref = _((h3 != null ? h3.children : void 0) || [])) != null ? _ref.any(function(child) {
      var _ref1, _ref2;

      if (!(child != null ? child.children : void 0)) {
        return false;
      }
      return (child != null ? (_ref1 = child.children) != null ? (_ref2 = _ref1[0]) != null ? _ref2.data : void 0 : void 0 : void 0) === " (YT Partner)";
    }) : void 0;
  };

  parsers.box = function(td, td2) {
    var a, b, children, e, _ref, _ref1;

    children = td != null ? td.children : void 0;
    if (children) {
      b = _(children).find(function(c) {
        return c.name === 'b';
      });
      if (b) {
        return b != null ? b.children[0].children[0].data : void 0;
      }
      a = _(children).find(function(a) {
        return a.name === 'a';
      });
      try {
        if (a) {
          return a != null ? (_ref = a.children) != null ? (_ref1 = _ref[0]) != null ? _ref1.data : void 0 : void 0 : void 0;
        }
      } catch (_error) {
        e = _error;
        console.error(a);
      }
    }
    return null;
  };

  ok = function(x) {
    return x != null;
  };

  parsers.boxes = function(trs) {
    var xs;

    xs = _(trs).map(parsers.boxes.row);
    return {
      other: _(xs).chain().pluck("other").filter(ok).value(),
      included: _(xs).chain().pluck("included").filter(ok).value()
    };
  };

  parsers.boxes.similar = function(trs) {
    var xs;

    xs = _(trs).map(parsers.boxes.similar.row);
    return {
      channel: _(xs).chain().pluck("channel").filter(ok).value(),
      view: _(xs).chain().pluck("view").filter(ok).value()
    };
  };

  parsers.boxes.similar.row = function(tr) {
    var b1, b2, d, tds;

    d = {};
    tds = tr.children;
    b1 = parsers.box(tds[1]);
    b2 = parsers.box(tds[6]);
    if (b1 != null) {
      d.channel = b1;
    }
    if (b2 != null) {
      d.view = b2;
    }
    return d;
  };

  parsers.boxes.row = function(tr) {
    var b1, b2, d, tds;

    d = {};
    tds = tr.children;
    b1 = parsers.box(tds[0], tds[1]);
    b2 = parsers.box(tds[2], tds[3]);
    if (b1 != null) {
      d.other = b1;
    }
    if (b2 != null) {
      d.included = b2;
    }
    return d;
  };

}).call(this);