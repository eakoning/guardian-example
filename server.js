'use strict'

const express = require('express')
const app = express()
const env = require('./lib/env')
const webpack = require('webpack')
const webpackMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.config.js')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const ensureApi2Token = require('./lib/middlewares/ensure_api2_token')
const loadUser = require('./lib/middlewares/load_user')
const loadUserEnrollments = require('./lib/middlewares/load_user_enrollments')
const session = require('express-session')

const mfaRoutes = require('./api/mfa_routes')
const stepUpRoutes = require('./api/step_up_routes')

const port = env['PORT'] || 3000

var idTokenCheck = require('./lib/id_token_check')

if (env.isDevelopment) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const compiler = webpack(config)
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  })

  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))
}

app.use(cookieParser(env['COOKIE_SECRET']))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '/public')))

app.use(session({
  secret: env['COOKIE_SECRET'],
  cookie: { secure: !env.isDevelopment, httpOnly: !env.isDevelopment },
  saveUninitialized: true,
  resave: false
}))

app.use(function (req, res, next) {
  req.pre = {}
  next()
})

app.use(ensureApi2Token)

app.use(mfaRoutes())
app.use(stepUpRoutes())

app.post('/api/login', function (req, res) {
  res.cookie('id_token', req.body.idtoken, {
    expires: new Date(Date.now() + 3600000),
    httpOnly: !env.isDevelopment,
    secure: !env.isDevelopment
  })

  res.status(200).end()
})

app.post('/api/logout', idTokenCheck, function (req, res) {
  res.clearCookie('id_token')
  res.status(200).end()
})

app.get('/api/users/me', idTokenCheck, loadUser, loadUserEnrollments(), function (req, res) {
  res.status(200).json(req.pre.user)
})

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.use(function (err, req, res, next) {
  if (!err) {
    return next()
  }

  console.error(err, err.stack)

  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ errorCode: 'invalid_token' })
  }

  if (!err.isBoom) {
    return res.status(500).send({ errorCode: 'server_error' })
  }

  return res.status(err.output.statusCode).json(err.output.payload)
})

app.listen(port, '0.0.0.0', function onStart (err) {
  if (err) {
    console.log(err)
  }

  console.info('Listening on port: ', port)
})