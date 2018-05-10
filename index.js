const fetch = require('isomorphic-fetch')
const fs = require('fs')
const mkdirp = require('mkdirp')

const mp3s = []

mkdirp.sync('audio')

console.log('Downloading feed')
fetch('http://datcast.cast.rocks/feed.xml')
  .then(res => res.text())
  .then(text => {
    text = text
      .replace(
        /http:\/\/cast.rocks\/hosting\/5887\/feeds\/(.*)\.jpg/,
        (_, g1) => `https://dat-cast.hashbase.io/img/${g1}.jpg`
      )
      .replace(
        /http:\/\/cast.rocks\/hosting\/5887\/(.*)\.mp3/gm,
        (_, g1) => {
          mp3s.push(g1)
          return `https://dat-cast.hashbase.io/audio/${g1}.mp3`
        }
      )
    fs.writeFileSync('feed.xml', text)
  })
  .then(() => {
    console.log('Downloading HTML')
    return fetch('http://datcast.cast.rocks/')
  })
  .then(res => res.text())
  .then(text => {
    // Example: https://ca-ns-1.bulkstorage.ca/v1/AUTH_0d09c87549084f4ba4ad4a9e807d0d76/5887/feeds/DCUP0.html?temp_url_sig=9c0a641a6288d71ab1bb0b597010500236978369&temp_url_expires=1524780293&inline
    const re = 'body.*src="(https:\/\/ca-ns-1.bulkstorage.ca\/\.*DCUP0.html.*inline)"'
    const match = text.match(new RegExp(re, 'm'))
    if (!match) throw new Error("Couldn't match body url")
    const url = match[1]
    return fetch(url)
  })
  .then(res => res.text())
  .then(text => {
    text = text
      .replace(
        /https:\/\/cast-cache\.s3\.amazonaws.com(\/castette\/.*\.png)/gm,
        (_, g1) => g1
      )
      .replace(
        /(https:)?\/\/cast\.rocks\/hosting\/5887\/feeds\/(DCUP0\.jpg)/gm,
        (_, g1, g2) => `/img/${g2}`
      )
      .replace(
        /(https:)?\/\/cast\.rocks\/hosting\/5887\/feeds\/(DCUP0\.html)/gm,
        (_, g1, g2) => `/${g2}`
      )
      .replace(
        /\/\/cast\.rocks\/hosting\/5887\/(.*\.mp3)/gm,
        (_, g1) => `/audio/${g1}`
      )
      .replace(
        /https:\/\/cast-cache\.s3\.amazonaws.com\/(.*\.svg)/gm,
        (_, g1) => `/castette/${g1}`
      )
      .replace(
        /http:\/\/cast\.rocks\/hosting\/5887\/feeds\/DCUP0\.xml/gm,
        () => `/feed.xml`
      )
    text = text.split('\n')
      .filter(line => !line.match(/script.*typekit/i))
      .join('\n')
    fs.writeFileSync('DCUP0.html', text)
  })
  /*
  .then(() => {
    console.log('Downloading mp3s')
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
  */
  .then(() => { console.log('Done.') })
  .catch(err => console.error('Error', err))
