const fetch = require('isomorphic-fetch')
const fs = require('fs')
const mkdirp = require('mkdirp')

const mp3s = []

mkdirp.sync('audio')

console.log('Downloading feed')
fetch('http://datcast.cast.rocks/feed.xml')
  .then(response => response.text())
  .then(text => {
    text = text
      .replace(
        /http:\/\/cast.rocks\/hosting\/5887\/feeds\/(.*)\.jpg/,
        (_, g1) => `https://dat-cast.hashbase.io/img/${g1}.jpg`
      )
      .replace(
        /http:\/\/cast.rocks\/hosting\/5887\/(.*)\.mp3/,
        (_, g1) => {
          mp3s.push(g1)
          return `https://dat-cast.hashbase.io/audio/${g1}.mp3`
        }
      )
    fs.writeFileSync('feed.xml', text)
    console.log('Done.')

    console.log('Downloading mp3s')
  })
  .then(() => {
    return mp3s.reduce((prevPromises, mp3) => {
      const promise = prevPromises
        .then(() => {
          console.log(`Downloading: ${mp3}.mp3`)
          url = `http://cast.rocks/hosting/5887/${mp3}.mp3`
          console.log(url)
          return fetch(url)
        })
        .then(res => res.buffer())
        .then(buf => { fs.writeFileSync(`./audio/${mp3}.mp3`, buf) })
      return promise
    }, Promise.resolve())
  })
  .then(() => { console.log('Done.') })
  .catch(err => console.error('Error', err))
