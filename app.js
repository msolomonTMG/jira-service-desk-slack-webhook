'use strict';

const
  express = require('express'),
  slack = require('slack'),
  bot = slack.rtm.client(),
  token = process.env.SLACKBOT_TOKEN;

var app = express();
app.set('port', process.env.PORT || 5000);

bot.team_join(function(obj) {
  console.log("Team join triggered");
  slack.chat.postMessage({
    token: token,
    channel: obj.user.id,
    text: "Hello and welcome to Group Nine Slack!",
    attachments: [
      {
        fallback: "Read the Group Nine Slack Guidelines",
        color: "#000000",
        title: "Group Nine Slack Guidelines",
        title_link: "https://api.slack.com/",
        text: "Make sure to read our Slack Guidelines"
      },
      {
        fallback: "Setup Your Slack Profile",
        color: "#000000",
        pretext: "Setup your profile",
        title: "How To Guide",
        title_link: "https://cl.ly/2g2i1C3U0e2L",
        fields: [
          {
              title: "Full Name",
              value: "Let us know who you are!",
              short: true
          },
          {
              title: "Profile Picture",
              value: "Show your face :)",
              short: true
          },
          {
              title: "What You Do",
              value: "werk werk werk werk werk",
              short: false
          }
        ]
      },
      {
        fallback: "Get familiar with Slack",
        color: "#000000",
        pretext: "Get familiar with Slack",
        title: "Browse Slack Groups",
        title_link: "https://cl.ly/2g2i1C3U0e2L",
        text: "Get the Who's Who in Group Nine",
        fields: [
          {
              title: "Need Help?",
              value: "Join #gn-slack-questions",
              short: false
          }
        ]
      }
    ]
  }, function(err, data) {
      console.log('error')
      console.log(err)
      console.log(data)
  });
});

bot.listen({token: token});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
