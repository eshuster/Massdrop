var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');  // get body-parser
var morgan     = require('morgan');     // used to see requests
var mongoose   = require('mongoose');
var Job       = require('./app/models/job');
var port       = process.env.PORT || 8080; // set the port for our app
var request = require('request');

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

// log all requests to the console
app.use(morgan('dev'));

mongoose.connect('mongodb://localhost/job_queue')
// ROUTES FOR OUR API
// ======================================

// basic route for the home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
  // do logging
  console.log('Somebody just came to our app!');

  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /jobs
// ----------------------------------------------------
apiRouter.route('/jobs')
  .post(function(req, res) {
    var job = new Job();    // create a new instance of the job model
    request(req.body.status, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          job.status = body;
      }
    });

    setTimeout(function(){
      job.save(function(err) {
        if (err) {
          // duplicate entry
          if (err.code == 11000)
            return res.json({ success: false, message: 'A job with that jobID already exists. '});
          else
            return res.send(err);
        } else {
          res.json({ message: 'Job created!' });
        }
      });
    }, 500)
  })


  .get(function(req, res) {
    Job.find(function(err, jobs) {
      if (err) return res.send(err);
      res.json(jobs);
    });
  });

apiRouter.route('/jobs/:job_id')
  .get(function(req, res) {
    Job.findById(req.params.job_id, function(err, job) {
      if (err) return res.send(err);
      res.json(job);
    });
  })

  // update the job with this id
  .put(function(req, res) {
    Job.findById(req.params.job_id, function(err, job) {

      if (err) return res.send(err);
      if (req.body.status) job.status = req.body.status;

      // save the job
      job.save(function(err) {
        if (err) return res.send(err);

        // return a message
        res.json({ message: 'Job updated!' });
      });

    });
  })

  // delete the job with this id
  .delete(function(req, res) {
    Job.remove({
      _id: req.params.job_id
    }, function(err, job) {
      if (err) return res.send(err);

      res.json({ message: 'Job successfully deleted' });
    });
  });

// REGISTER OUR ROUTES -------------------------------
app.use('/api', apiRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);