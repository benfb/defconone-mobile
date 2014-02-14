var util = require("util");
var Client = require('telapi').client;
var client = new Client(process.env.TELAPI_SID, process.env.TELAPI_TOKEN2);
var config = require('../config.js');
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

exports.email = function(req, res){
  var suc = true;
  var crisis = req.param('crisis', null);
  for(var i = 0; i < req.user.contacts.length; i++){
    if(req.user.contacts[i].email != null){
      var addr = req.user.contacts[i].email;
      var etxt = 'Email ' + req.user.name + config.email;
      if(crisis=="true"){
        etxt = config.cemail + req.user.name + ' (via the Defcon One app)';
      }
      sendgrid.send({
          to: addr,
          fromname: "Defcon One",
          from: process.env.SENDGRID_USERNAME,
          subject: 'Emergency! ' + req.user.name + ' needs your help',
          text: etxt}, function(success, message) {
      if (!success) {
        console.log(message);
        suc = false;
      }
      else
        console.log(message);
        suc = true;
      });
    }
  }
  if(suc == true) {
    req.flash('success', 'Emails sent successfully.');
    res.redirect('back');
  }
  else {
    req.flash('error', 'An error occured while sending emails.');
    res.redirect('back');
  }
};

exports.sms = function(req, res){
  var crisis = req.param('crisis', null);
  var suc = true;
	for(var i = 0; i < req.user.contacts.length; i++){
    if(req.user.contacts[i].phone != null){
      var currentPhone = req.user.contacts[i].phone;
      var options = {
    	    From: process.env.TELAPI_NUMBER,
    	    To: currentPhone,
          Body: req.user.name + config.sms
    	};
      if(crisis=="true"){
        options.Body = req.user.name + config.csms;
      }
      client.create("sms_messages", options, function (response) {
              util.log("SmsMessage SID: " +  response.sid);
              suc = true;
    	    },
    	    function (error) {
    	        util.log("Error: " + error);
              suc = false;
    	    }
    	);
    }
  }
  if(suc == true) {
    req.flash('success', 'Text messages sent successfully.');
    res.redirect('back');
  }
  else {
    req.flash('error', 'An error occured while sending text messages.');
    res.redirect('back');
  }
}