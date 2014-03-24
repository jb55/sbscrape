
debug = require('debug')('sbscrape:parsers')
lazy = require('lazy-string')
parsers = module.exports
{ _ }   = require 'underscore'

parsers.delta = (str) ->
  start = str?[0]
  num = _(str?[1..]).reject((x) -> x is ',').join("")
  switch start
    when '+' then +num
    when '-' then -num
    else 0

parsers.average = (td) ->
  average: parsers.delta(td?.children?[0]?.children?[0]?.data)
  total: parsers.delta(td?.children?[2]?.children?[0]?.data)

parsers.summary = (tds) ->
  subscribers: parsers.average(tds?[1])
  contacts:    parsers.average(tds?[4])
  views:
    video:   parsers.average(tds?[2])
    channel: parsers.average(tds?[3])

parsers.date = (datestring) ->
  x = datestring.replace(/&nbsp;.*/, "")
  x.replace(/\s/, "")

parsers.number = (n) -> +(n?.replace(/[, ]/g,""))

parsers.integer = (n) ->
  n = parsers.number(n)
  if n < 0 then 0 else n

parsers.change = (tds) ->
  date: parsers.date(tds?[0]?.children?[0].data)
  total: parsers.number(tds?[2]?.children?[0].data)

#
# Get data from the modules at the top of the page
#
findModule = (modules, name) ->
  re = new RegExp(name, "i")
  module = _(modules).find (module, ind) ->
    label = module?.children?[1]?.children?[0]?.data
    return true if re.test(label)
    return false
  return module?.children?[3]?.children?[0]?.data

parsers.page = (o) ->
  userInfo = o("#UserInformation")?[0]
  summary = o(".SummaryWrap div p span")
  viewInfo = userInfo?.children?[4]?.data
  subInfo = userInfo?.children?[6]?.data
  averageInfo = (n) -> summary?[n]?.children?[0]?.data
  modules = o(".stats-top-data-module")

  totalSubscribers = findModule(modules, "subscribers")
  totalViews = findModule(modules, "video views")
  debug(parsers.number(totalViews))

  number = /-?[\d,]+/

  summary:
    subscribers:
      total: parsers.number(totalSubscribers)
      average: parsers.number(averageInfo(3)?.match(number)?[0])
    views:
      total: parsers.number(totalViews)
      average: parsers.integer(averageInfo(1)?.match(number)?[0])

parsers.changes = (table) ->
  rows = table?.children or []
  averageTds = _.last(rows)?.children
  entries = rows[3...-1]
  change = _.compose(parsers.change, ((tr) -> tr?.children))
  entries: entries.map(change)
  summary: parsers.summary(averageTds)

parsers.claimedBy = (as) ->
  if as[2]?.children[0]?.raw is "Network/Claimed By:"
    return as[3]?.children[0]?.raw
  return ""

parsers.isYtPartner = (h3) ->
  _(h3?.children or [])?.any (child) ->
    return false unless child?.children
    child?.children?[0]?.data is " (YT Partner)"

parsers.box = (td, td2) ->
  children = td?.children
  if children
    b = _(children).find((c) -> c.name is 'b')
    return b?.children[0].children[0].data if b
    a = _(children).find((a) -> a.name is 'a')
    try
      return a?.children?[0]?.data if a
    catch e
      console.error a
  null

ok = (x) -> x?

parsers.boxes = (trs) ->
  xs = _(trs).map(parsers.boxes.row)
  other: _(xs).chain().pluck("other").filter(ok).value()
  included: _(xs).chain().pluck("included").filter(ok).value()

parsers.boxes.similar = (trs) ->
  xs = _(trs).map(parsers.boxes.similar.row)
  channel: _(xs).chain().pluck("channel").filter(ok).value()
  view: _(xs).chain().pluck("view").filter(ok).value()

parsers.boxes.similar.row = (tr) ->
  d = {}
  tds = tr.children
  b1 = parsers.box(tds[1])
  b2 = parsers.box(tds[6])
  d.channel = b1 if b1?
  d.view = b2 if b2?
  d

parsers.boxes.row = (tr) ->
  d = {}
  tds = tr.children
  b1 = parsers.box(tds[0], tds[1])
  b2 = parsers.box(tds[2], tds[3])
  d.other = b1 if b1?
  d.included = b2 if b2?
  d


