parsers    = require './parsers'
scrapeit   = require 'scrapeit'

root = "http://socialblade.com/youtube/user/"

scrapers = module.exports

scrapers.stats = (user, cb) ->
  user = user.slice(1) if user[0] is "'"
  url = root + user
  retBad = -> cb null, { bad: yes, badUser: user }
  scrapeit url, (err, o)->
    return retBad() if err

    page = parsers.page(o)

    cb(null, { page: page })

scrapers.otherchans = (user, cb) ->
  url = "#{ root }#{ user }/otherchans"
  retBad = -> cb null, { included: [], other: [] }

  scrapeit url, (err, o) ->
    return retBad() if err

    rows = o("table")?[0]?.children
    return retBad() unless rows

    rows.shift()

    return cb null, parsers.boxes rows

scrapers.similar = (user, cb) ->
  url = "#{ root }#{ user }/similarrank"
  retBad = -> cb null, { channel: [], view: [] }

  scrapeit url, (err, o) ->
    return retBad() if err

    rows = o("table")?[0]?.children
    return retBad() unless rows
    rows.shift() #header
    rows.shift() #header2

    return cb null, parsers.boxes.similar rows

