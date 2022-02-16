#!/usr/bin/env node

import startFollowing from './linkfollower.js'

const follow = async url => {
    const visits = await startFollowing(url)
    visits.map(v => v.redirect ? `${v.url} -> ${v.status}` : `${v.url} -> ${v.status || ""}`)
          .forEach(v => console.log(v))
}

let url = process.argv[2];
if (!url) {
   console.log('Usage: follow <URL>')
   process.exit(1)
}

follow(url)