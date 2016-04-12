module.exports = [{
  output: {
    path: './dist',
    filename: 'app.js'
  },
  entry: {
    app: './index.js'
  }
}]

// packing shake-example add.js while testing
/*
{
  output: {
    path: './shake-example',
    filename: 'packed-app.js'
  },
  entry: {
    app: './shake-example/pack.js'
  }
}
*/
