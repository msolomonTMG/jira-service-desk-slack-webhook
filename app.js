'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// route for waking up the heroku app when a member joins
app.post('/jira-service-desk', function(req, res) {
  let issue = req.body.issue
  let jiraURL = issue.self.split('/rest/api')[0]


  let postData = {
    text: "An urgent issue has been reported!",
    attachments: [
      {
        fallback: `${issue.fields.creator.name} created <${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
        color: "danger", // Can either be one of 'good', 'warning', 'danger', or any hex color code
        title: `<${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
        thumb_url: `${issue.fields.creator.avatarUrls["48x48"]}`,
        fields: [
          {
            title: "Brand",
            value: `${issue.fields.customfield_11305.value}`,
            short: true
          },
          {
            title: "Reporter",
            value: `${issue.fields.creator.displayName}`,
            short: true
          },
          {
            title: "Steps to Reproduce",
            value: `${issue.fields.customfield_11202}`,
            short: false
          }
        ]
      }
    ]
  }
  console.log(postData)

  let url = `https://hooks.slack.com/services/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`

  let options = {
    method: 'post',
    body: postData,
    json: true,
    url: url
  }

  request(options, function(err, res, body) {
    if (err) {
      console.error('error posting json: ', err)
    } else {
      console.log('alerted Slack')
    }
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
