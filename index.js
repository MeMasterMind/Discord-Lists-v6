const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Strategy = require('passport-discord').Strategy
const app = express()
const fs = require('fs')
const parser = require('body-parser')
require("dotenv").config()
const mongoose = require('mongoose')
const addbot = require('./models/bots')
const member = require('./models/users')
const votes12hr = require('./models/votes-12h.js')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()
const websiteURL = "https://discordlists100.xyz";

const PORT = process.env.PORT || 3000 //i changed the port to 3000 since 5000 was causing errors
//ok
/*
* @param1 {string}: Required, message text in String format.
* 
* @param2 {function | Object}: Optional, a callback function when the notification element has been clicked. Or, extend the initialize options with new options for each notification element.
*
* @param3 {Object}: Optional, extend the initialize options with new options for each notification element (if the second parameter is a callback function).
*/

// Client (Bot) Ready Event
client.once('ready', () => {
  client.user.setActivity('dl!help | discordlists100.xyz', { type: 'WATCHING' });
  console.log('[EVENT] Bot Is Online!\n[EVENT] Block Chain Is Online')
})



app.use(parser.urlencoded({ extended: false })) // Encoding
app.use(parser.json()) // Parsing json objects
app.set('view engine', 'ejs') // Set the view engine as ejs
app.use(express.static(__dirname + '/public'));
passport.serializeUser(function(user, done) {
  done(null, user)
});

passport.deserializeUser(function(obj, done) {
  done(null, obj)
});

// Scopes
var scopes = ['identify', 'email', 'guilds']
var prompt = 'consent';

// SECRETS FOR CALLBACK SESSION (STORE THEM IN ENV FILE)
passport.use(new Strategy({
  clientID: '870310174953467985',
  clientSecret: 'mFAERH4aSakeJrJeWwfuwUVo_THgIFMc',
  callbackURL: 'https://discordlists100.xyz/api/callback',
  scope: scopes,
  prompt: prompt,
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile)
  });
}));

// Storing current session (Cookies)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));




app.use(passport.initialize()) // Using passport
app.use(passport.session()) // Using session




//Home page
app.get('/', async function(req, res) {
  const login_logout = req.isAuthenticated()
  const verified_bots = await addbot.find({ state: 'verified' })
  const random_bot = await addbot.find({ state: 'verified' })
  const certified_bots = await addbot.find({ certification: 'certified' })
    res.render('index', {
    verified_bots: verified_bots,
    certified_bots: certified_bots,
    random_bot: random_bot,
    login_logout: login_logout
  })
})




app.get('/bots', (req, res) => {
  res.redirect('/')
})

app.get('/twitter', (req, res) => {
  res.redirect("https://twitter.com/discordlists100");
})

app.get('/discord', (req, res) => {
  res.redirect("https://discord.gg/B6b8vqZHfF")
})

app.get('/bug', async function(req, res) {
  const login_logout = req.isAuthenticated()
  const verified_bots = await addbot.find({ state: 'verified' }).limit(2)
  const random_bot = await addbot.find({ state: 'verified' }).limit(1)
  const certified_bots = await addbot.find({ certification: 'certified' })
  res.render('bugs', {
    verified_bots: verified_bots,
    certified_bots: certified_bots,
    random_bot: random_bot,
    login_logout: login_logout
  })
})


app.get('/beta', async function(req, res) {

  res.redirect('/')
})


// Login with Discord
app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) { })

// Callback the user
app.get('/api/callback',
  passport.authenticate('discord', { failureRedirect: '/' }), async function(req, res) {
    let avatarID = req.user.avatar
    let userID = req.user.id
    const avatarURL = "https://cdn.discordapp.com/avatars/"+userID+"/"+avatarID

    res.redirect('/user/@me')
    client.channels.cache.get(process.env.LOGS_CHANNEL).send(
      new Discord.MessageEmbed()
        .setTitle('Login Detected')
        .setColor('GREEN')
        .setDescription(`\`${req.user.username}\` just logged into the site.`)
        .setImage(avatarURL)
        .setTimestamp()
    )
  });

app.get('/main', (req,res)=>{
  res.redirect('/')
})

//Search Routes
app.get('/s', async function (req,res){
  const query = req.query.search.toLowerCase()

  const promise = addbot.find({state:"verified"})

  let searchResults = []

  var login_logout = req.isAuthenticated()
  promise.then(allBots=>{

    allBots.forEach(item=>{

      var botname = item.botname.toLowerCase()
      var longdes = item.longdes.toLowerCase()
      var shortdes = item.shortdes.toLowerCase()
      
      var tags
      if(item.tags){
        tags = item.tags.toString().toLowerCase()
      }
      if(botname.includes(query) || longdes.includes(query) || shortdes.includes(query) || tags.includes(query)){
        searchResults.push(item)        
      }
    })
    res.render("search", {
      searchResults,
      query,
      login_logout})
  })
})

app.get('/search', (req,res)=>{
  const login_logout = req.isAuthenticated()
  const query = false
  const searchResults = false
  res.render("search", {
    login_logout,
    query,
    searchResults})
})

app.get('/somvote', checkAuth, async function (req, res) {
  const login_logout = req.isAuthenticated()
  res.render('staffvote', {
    login_logout: login_logout
  })
})

//Logging out the user
app.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

// System check run
app.get('/info', checkAuth, async function(req, res) {
  res.sendStatus(200)
})

// Redirecting error header to ejs page
app.get('/error', function(req, res) {
  const login_logout = req.isAuthenticated()
  res.render('error', {
    code: req.query.code,
    message: req.query.message,
    login_logout: login_logout
  })
})

// Redirecting...
app.get('/success', function(req, res) {
  const login_logout = req.isAuthenticated()
  res.render('success', {
    login_logout
  })
})

//Redirecting...
app.get('/partners', function(req, res) {
  const login_logout = req.isAuthenticated()
  res.render('partners', {
    login_logout
  })
})





const checkAdmin = async (req, res, next) => {
  const reqUser = req.user
  const guild = await client.guilds.cache.get(process.env.SERVERID)
  const role = await guild.members.cache.filter(member => member.roles.cache.find(role => role.name === "Panel Access")).map(member => member.id)
  console.log(guild)
  console.log(role)

  const bool =role.find(userID=>userID == reqUser.id)
  console.log(bool)

  if(bool){
    next()
  }
  else{
    res.redirect("/error?code=403&message=You don't have sufficient permissions to access this page!")
  }
}


//Staff Panel:
app.get('/staffpanel', checkAuth, checkAdmin,  async function(req, res) {
  const login_logout = req.isAuthenticated()
  const unverifiedBot = await addbot.find({ state: "unverified" })

  res.render('staff-panel', {
    login_logout, unverifiedBot
  })
})

//Accept bot from StaffPanel
app.get("/staffpanel/accept/:id", checkAuth, async (req, res) => {
  const ID = req.params.id
  await addbot.findOne({botid: ID}).then(bot=>{
  const acceptembed = new Discord.MessageEmbed()
    .setTitle('Bot Approved:')
    .setDescription('A new bot has been approved by our reviewers.')
    .addField('Bot: ', bot.botname)
    .addField('Website: ', websiteURL + '/bot/' + ID)
    .addField('Moderator: ', req.user.username + '#' + req.user.discriminator)
    .setFooter('Discord Lists | Bot Approved')
    .setColor('GREEN')
  })
  await addbot.findOneAndUpdate(
    {
      botid: ID
    },
    {
      state: 'verified'
    },
    { upsert: true }
  ).then(res.redirect("/staffpanel"))
    .then(client.channels.cache.get(process.env.LOGS_CHANNEL).send(acceptembed))
    .catch(err => {
      res.redirect("/error")
    }
    )
})

//Deny and Delete bot from Staffpanel

app.post("/staffpanel/delete/:id", checkAuth, async (req, res) => {
  const ID = req.params.id
  let botname = req.body.botname
  await addbot.findOneAndRemove({
    botid: ID
  }).then(res.redirect("/staffpanel"))
    .then(client.channels.cache.get(process.env.LOGS_CHANNEL).send(req.user.username + "#" + req.user.discriminator + " has just Denied and permanently deleted " + botname))


})

// Redirecting...
app.get('/edit/success', function(req, res) {
  const login_logout = req.isAuthenticated()
  res.render('editsuccess', {
    login_logout
  })
})

// Redirecting...
app.get('/addbot', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()
  res.render('add', {
    login_logout,
  })
})

// Adding bot to MongoDB if there no such data
app.post('/addbot/success', checkAuth, async function(req, res) {
  const info = req.body.id
  const userinfo = req.user
  const token = process.env.TOKEN
  const fetchuser = async id => {
    const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
      headers: {
        Authorization: `Bot ${token}`
      }
    });
    if (!response.ok) throw new Error(`Error status code: ${response.status}`)
    return await response.json()
  }
  (async () => {
    let data = await fetchuser(info).catch(err => {
      console.error(err)
      res.redirect('/error?code=400&message=bot id is not valid')
    })
    const bot = await addbot.findOne({ botid: req.body.id })
    let avatar = data.avatar
    if (avatar === null) {
      avatar = `https://discord.com/assets/2d20a45d79110dc5bf947137e9d99b66.svg`
    } else {
      avatar = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
    }
    // If there is no bot add it to database
    if (!bot) {
      await addbot.findOneAndUpdate(
        {
          botname: data.username
        },
        {
          botid: data.id,
          botavatar: `${avatar}`,
          shortdes: req.body.short,
          longdes: req.body.long,
          botprefix: req.body.prefix,
          bottoken: `botzer` + makeAPI(30),
          botowner: `${userinfo.username}#${userinfo.discriminator}`,
          ownerid: `${userinfo.id}`,
          invite: req.body.invite,
          support: req.body.server,
          site: req.body.site,
          github: req.body.github,
          state: 'unverified',
          certification: 'uncertified',
          servercount: 'N/A',
          vanity: '',
          tags: req.body.tags
        },
        { upsert: true }
      )
    } // If not redirect to error page
    else {
      res.redirect('/error?code=403&message=bot is already in the list')
    }
    await member.findOneAndUpdate(
      {
        $push: {
          userbots: `${data.id}`
        }
      }
    )
    res.redirect('/bot/' + data.id)
    console.log(data)
    let embed = new Discord.MessageEmbed()
      .setTitle('New Bot Queued:')
      .setDescription('A new is waiting for approval.')
      .addField('Bot Developer:', "" + userinfo.username + userinfo.discriminator + "")
      .addField('Bot:', "<@" + data.id + ">")
      .setFooter('Discord Lists | Queued Bot')
      .setColor('YELLOW')
    client.channels.cache.get(process.env.LOGS_CHANNEL).send(embed);
    client.channels.cache.get(process.env.LOGS_CHANNEL).send('<@&869945590115622946>');
  })()
})

// Getting the bot by ID
app.get('/bot/:botid', async function(req, res) {
  const login_logout = req.isAuthenticated()

  const botid = await addbot.findOne({ botid: req.params.botid })
  if (!botid) return res.redirect('/error?code=404&message=invalid bot')
  const deslong = botid.longdes
  res.render('bot', {
    botid: botid,
    deslong: deslong,
    login_logout,
  })
})

// Redirecting...
app.get('/bot/:botid/edit', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

  const info = req.user
  const botid = await addbot.findOne({ botid: req.params.botid })
  if (!botid) return res.redirect('/error?code=404&message=invalid bot')
  const owner = botid.botowner
  if (!`${info.username}#${info.discriminator}` === owner) {
    res.redirect('/error?code=403&message=You are unauthorized to access this page')
  }

  res.render('edit', {
    botid: botid,
    login_logout: login_logout
  })
})

// Editing bot
app.post('/botedit/success/:botid', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

  await addbot.findOneAndUpdate(
    {
      botid: req.params.botid
    },
    {
      shortdes: req.body.short,
      longdes: req.body.long,
      botprefix: req.body.prefix,
      invite: req.body.invite,
      support: req.body.server,
      site: req.body.site,
      github: req.body.github,
    }
  )
  client.channels.cache.get(process.env.LOGS_CHANNEL).send(req.user.username + "#" + req.user.discriminator + " Has updated their bot. (" + websiteURL + "/bot/" + req.params.botid + ")")
  res.redirect(`/bot/${req.params.botid}`)
})

// Redirecting...
app.get('/bot/:botid/delete', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

  const info = req.user
  const botid = await addbot.findOne({ botid: req.params.botid })
  if (!botid) return res.redirect('/error?code=404&message=invalid bot id')
  const owner = botid.botowner
  if (!`${info.username}#${info.discriminator}` === owner) return res.redirect('/error?code=403&message=your are unauthorized to access this page')
  res.render('delete', {
    botid: botid,
    login_logout: login_logout
  })
})

// Deleting a bot
app.post('/bot/delete/:botid', async function(req, res) {
  const login_logout = req.isAuthenticated()

  if (req.body.DELETE === 'DELETE') {
    await addbot.findOneAndRemove(
      {
        botid: req.params.botid
      }
    ), res.redirect('/user/me')
  } else {
    res.redirect('/error?code=403&message=you are unauthorized to delete the bot until you type DELETE in the text area')
  }
})

//Vanity URL 
app.get('/bot/x/:vanity', async function(req, res) {
  const login_logout = req.isAuthenticated()

  const vanity = await addbot.findOne({ vanity: req.params.vanity })
  const botid = vanity
  if (vanity) {
    res.render('bot', {
      botid: vanity,
      deslong: vanity.longdes,
      login_logout: login_logout
    })
  }
})

app.get('/bot/:botid/certification', checkAuth, async function(req, res) {
    const login_logout = req.isAuthenticated()

  const botid = await addbot.findOne({ botid: req.params.botid })
  if (!botid) {
    res.redirect('/error?code=404&message=We cannot find a bot with that ID')
  }
  res.render('certifications', {
    botid: botid,
    login_logout: login_logout
  })
})

app.post('/bot/:botid/certification', async function(req, res){
        addbot.findOneAndUpdate(
                {
                        botid: req.params.botid
                },
                {
                        certification: 'pending'
                }
        )
        res.redirect(`/bot/${req.params.botid}`)
        
})

//Voting API
app.get('/bot/:botid/vote', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

  const botid = await addbot.findOne({ botid: req.params.botid })


  await votes12hr.find().then(async (vote12hr)=>{

  let hasUserAlreadyVoted12hr = false


  if(vote12hr.some(e=>e.userid === req.user.id)){
    hasUserAlreadyVoted12hr = true
  }


    res.render('vote', {
        hasUserAlreadyVoted12hr,
        botid,
        login_logout
      })
    })
  })




app.post('/bot/vote/:botid', checkAuth, async function(req, res) {
    const userVote12hr = new votes12hr({
    username: req.user.username + '#'+ req.user.discriminator,
    userid: req.user.id,
    botid: req.params.botid,
    date: Date.now(),
    ms: 45000
  })
   await userVote12hr.save()
  res.redirect('/bot/'+req.params.botid+'/vote')
})

//DELETE ALL VOTES 

//  votes12hr.deleteMany({ms:45000}).then(data=>console.log(data))

// My Profile Data
app.get('/user/@me', checkAuth, async function(req, res) {
  const user = req.user
  const login_logout = req.isAuthenticated()
  const me = await member.findOne({ username: `${req.user.username}#${req.user.discriminator}` })
  if (!me) {
    await member.findOneAndUpdate(
      {
        username: `${req.user.username}#${req.user.discriminator}`
      },
      {
        userid: req.user.id,
        userbots: [],
        useravatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      },
      { upsert: true }
    )
  }
  const botdata = await addbot.find({ botowner: `${req.user.username}#${req.user.discriminator}` })
  const bots = botdata

  const reqUser = req.user
  let userHasAccessToStaffPanel = false;
  const guild = await client.guilds.cache.get(process.env.SERVERID)
  const role = await guild.members.cache.filter(member => member.roles.cache.find(role => role.name === "Panel Access")).map(member => member.id)

  const bool =role.find(userID=>userID == reqUser.id)

  if(bool){
    userHasAccessToStaffPanel = true
  }

  res.render('me', {
    bots,
    user,
    login_logout,
    userHasAccessToStaffPanel
  })
})

app.get('/user/:userid', async function(req, res) {
  const user = await member.findOne({ userid: req.params.userid })
  const bots = await addbot.find({ ownerid: req.params.userid })
  if (!user) {
    res.redirect('/error?code=404&message=no use found with that user id')
  } else {
    res.render('user', {
      user: user,
      bots: bots,
      login_logout: login_logout
    })
  }
})

// Other Links
app.get(['/invite', '/join'], async function(req, res) {
  res.redirect("https://discord.gg/B6b8vqZHfF")
})

app.get('/terms', async function(req, res) {
  res.redirect("https://github.com/Discord-Lists/Terms-Of-Service")
})

app.get('twitter', async function(req, res) {
  res.redirect('https://twitter.com/DiscordLists100')
})

app.get('/github', async function(req, res) {
  res.redirect('https://github.com/Discord-Lists')
})
//Partnerships: 
// API
app.get('/api', function(req, res) {
  res.redirect('https://a-botlist-without-a-name.crazybotboy.repl.co/404')
})

app.post('/api/:botid/stats', async function(req, res) {
  const bot_data = await addbot.findOne({ botid: req.params.botid })
  if (!bot_data) return res.json({ "code": "404", "message": "bot not found" })
  let token = req.header('Authorization')
  if (!token) return res.json({ "code": "401", "message": "client token not found on authorization" })
  if (!req.params.botid) return res.json({ "code": "403", "message": "you must enter your bot id" })
  const data = await addbot.findOne({ bottoken: token })
  if (!data) return res.json({ "code": "404", "message": "token not found" })
  if (bot_data) {
    res.json({ "code": "200", "message": "success" })
    return await addbot.findOneAndUpdate(
      {
        botid: req.params.botid
      },
      {
        servercount: req.header('ServerCount')
      }
    )
  }
})

app.get('/api/bot/:botid', async function(req, res) {
  const botid = await addbot.findOne({ botid: req.params.botid })
  if (!botid) return res.json({ "code": "404", "message": "bot not found" })
  res.json({
    "botname": botid.botname,
    "botid": botid.botid,
    "botavatar": botid.botavatar,
    "shortdes": botid.botdes,
    "longdes": botid.shortdes,
    "botprefix": botid.botprefix,
    "botowner": botid.botowner,
    "state": botid.state,
    "site": botid.site,
    "github": botid.github,
    "support": botid.support,
    "certification": botid.certification,
    "servercount": botid.servercount,
    "vanity": botid.vanity
  })
})

//Get the no of votes for each bot
app.get('/bot/:botid/getVotes', async (req,res)=>{
  const botid = await addbot.findOne({ botid: req.params.botid })
  if(!botid) return res.json({ "code": "404", "message": "cannot find the bot id" })
  var voteCount = 0
  votes12hr.find().then(data=>{
    data.forEach(object=>{
      if(object.botid === req.params.botid){
        voteCount++
      }
    })
      res.json({ "votes": voteCount})
  })
})

app.get('/faq', (req,res)=>{
  const login_logout = req.isAuthenticated()
  res.render("faq", {
    login_logout
  })
})

// Discord OAuth2 Check
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

//API Function
function makeAPI(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Starting Express Server With PORT 5000
app.listen(PORT, async function(err) {
  await mongoose.connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }).then(console.log('Successfully connected to the mongoDB database'))
  if (err) console.error(err)
  console.log('Listening at https://localhost:5000')
})

//Botlist bot
const PREFIX = 'dl!'
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}

client.on('message', async message => {

  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(client, message, args)
  } catch (err) {
    console.error(err)
    message.channel.send({
      embed: {
        color: 'RED',
        description: 'There was an error on our end. Please try again later'
      }
    })
  }
})

client.login(process.env.TOKEN)


//rendering the 404 page
app.use(function(req, res, next) {
  const login_logout = req.isAuthenticated()
  res.status(404).render("404", {login_logout})
})

