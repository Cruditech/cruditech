const dotenv = require('dotenv');
const express = require('express');
// const { engine }  = require('express-handlebars');
// const hbs = require('hbs');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');
dotenv.config();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config.js');
const app = express();
const compiler = webpack(webpackConfig);
// app.set('views', path.join(__dirname, 'src/views/'));
// app.engine('handlebars', engine({
//   defaultLayout: false,

// }));
// app.set('view engine', 'hbs');
// app.engine('handlebars', hbs.__express);
// hbs.registerPartials(__dirname + '/src/views/partials', function (err) {
//   if (err) {
//     console.log(err);
//   }
// });

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const config = {
  authRequired: false,
  auth0Logout: true
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
} else {
  config.baseURL = process.env.BASE_URL;
}

app.use(auth(config));


var {exphbs} = require('express-handlebars'); 
app.engine('handlebars', 
exphbs({defaultLayout: 'none'})); app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
var options = { //dotfiles: 'ignore', etag: false,
extensions: ['htm', 'html', 'handlebars'],
index: false
};
app.use(express.static(path.join(__dirname, 'public') , options  ));


// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

app.use('/', router);
// app.get('/', function (req, res) {
//   res.render('privacy-policy');
// });

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  // res.render('error', {
  //   message: err.message,
  //   error: process.env.NODE_ENV !== 'production' ? err : {}
  // });
  res.send(err.message);
});

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });

