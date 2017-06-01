'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  slack = require('slack'),
  bot = slack.rtm.client(),
  token = process.env.SLACKBOT_TOKEN;

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// route for waking up the heroku app when a member joins
app.post('/msg-wake-up', function(req, res) {
  if (req.body.challenge) {
    res.send(req.body.challenge) // need to resp to challenge on install
  } else {
    //wake up!
    console.log('Im up!')
    res.send(200)
  }
})

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
        title_link: "https://docs.google.com/a/thrillist.com/document/d/1zFI_vSrdYHMLVPSlhIpnbwRWnKTLFmXjIj-n9mbIKHc/edit?usp=sharing",
        text: "Make sure to read our Slack Guidelines"
      },
      {
        fallback: "Setup Your Slack Profile",
        color: "#000000",
        pretext: "Setup your profile",
        title: "How To Guide",
        title_link: "https://groupninemedia.slack.com/account/profile",
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
        title: "Team Directory",
        title_link: "https://groupninemedia.slack.com/team",
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
