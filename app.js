'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  slack = require('./slack'),
  slackChannels = {
    techJiraServiceDesk: process.env.TECH_JIRA_SERVICE_DESK_URL,
    tlTechAndEdit: process.env.TL_TECH_AND_EDIT_URL,
    ddTechAndEdit: process.env.DD_TECH_AND_EDIT_URL,
    ntTechAndEdit: process.env.NT_TECH_AND_EDIT_URL,
    skTechAndEdit: process.env.SK_TECH_AND_EDIT_URL
  },
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/comment', function(req, res) {
  let comment = req.body.comment,
      issue = req.body.issue,
      jiraURL = issue.self.split('/rest/api')[0];

  console.log(req.body)

  let text = `${comment.author.displayName} commented on an issue`
  let attachments = [
    {
      fallback: `${comment.author.displayName} commented on <${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      title: `<${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      thumb_url: `${comment.author.avatarUrls["48x48"]}`,
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
          title: "Comment",
          value: `${comment.body}`,
          short: false
        }
      ]
    }
  ]
  slack.sendMessage([slackChannels.techJiraServiceDesk], text, attachments)
})

app.post('/created', function(req, res) {
  let text,
      color,
      urgentField = 'customfield_11306',
      issue = req.body.issue,
      jiraURL = issue.self.split('/rest/api')[0];

  let requestType;
  switch(issue.fields.issuetype.name) {
    case 'Bug':
      requestType = 'bug'
      break;
    case 'Story':
      requestType = 'feature request'
      break;
    case 'Support Email':
      requestType = 'support email'
      break;
    default:
      requestType = 'issue'
  }

  // if the urgent field is "yes", text and color are different
  if (issue.fields[urgentField] && issue.fields[urgentField][0].value == "Yes") {
    text = `An urgent ${requestType} has been reported!`
    color = 'danger'
  } else {
    text = `A ${requestType} has been reported`,
    color = '#205081'
  }

  let brand = issue.fields.customfield_11305.value

  let attachments = [
    {
      fallback: `${issue.fields.creator.name} created <${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      color: color, // Can either be one of 'good', 'warning', 'danger', or any hex color code
      title: `<${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      thumb_url: `${issue.fields.creator.avatarUrls["48x48"]}`,
      fields: [
        {
          title: "Brand",
          value: brand,
          short: true
        },
        {
          title: "Reporter",
          value: `${issue.fields.creator.displayName}`,
          short: true
        }
      ]
    }
  ]

  // if bug, show steps to repro. if feature (or anything else), show description
  switch(requestType) {
    case 'bug':
      attachments[0].fields.push({
        title: "Steps to Reproduce",
        value: `${issue.fields.customfield_11202}`,
        short: false
      })
      break;
    default:
      attachments[0].fields.push({
        title: "Description",
        value: `${issue.fields.description}`,
        short: false
      })
  }

  let urls = [slackChannels.techJiraServiceDesk]
  // send the message to each respective edit slack channel based on brand
  switch(brand) {
    case 'Thrillist':
    case 'Supercall':
      urls.push(slackChannels.tlTechAndEdit)
      break;
    case 'The Dodo':
      urls.push(slackChannels.ddTechAndEdit)
      break;
    case 'NowThis':
      urls.push(slackChannels.ntTechAndEdit)
      break;
    case 'Seeker':
      urls.push(slackChannels.skTechAndEdit)
      break;
    default:
      // do nothing, I don't recognize this brand
  }
  slack.sendMessage(urls, text, attachments)
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
