
var scrapers = require('..');
var should = require('should');
var debug = require('debug')('sbscrape:test');
var debugnull = require('debug')('null');
var lazy = require('lazy-string');

describe('stats scraper', function(){
  var stats;

  before(function(done){
    scrapers.stats('monstercatmedia', function(err, data) {
      should.not.exist(err);
      should.exist(data);

      stats = data;
      page = stats.page;
      summary = page.summary;
      subscribers = summary.subscribers;
      views = summary.views;

      debug(lazy(function(){ return JSON.stringify(stats); }));
      done();
    });
  });

  it('properties should exist', function(){
    should.exist(page, "stats.page");
    should.exist(summary, "stats.page.summary");
    should.exist(subscribers, "stats.page.summary.subscribers");
    should.exist(views, "stats.page.summary.subscribers.views");
  });

  it('averages should be positive', function() {
    subscribers.average.should.be.above(0);
  });

  it('views should be positive', function() {
    views.total.should.be.above(0);
    views.average.should.be.above(0);
  });

  it('subscribers should be positive', function() {
    subscribers.total.should.be.above(0);
    subscribers.average.should.be.above(0);
  });


});
