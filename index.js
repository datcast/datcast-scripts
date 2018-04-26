var fetch = require('isomorphic-fetch')

fetch('http://datcast.cast.rocks/feed.xml')
  .then(response => response.text())
  .then(text => {
    console.log(text)
  })
