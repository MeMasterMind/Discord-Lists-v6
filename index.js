const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Strategy = require('passport-discord').Strategy
const app = express()
const fs = require('fs')
const parser = require('body-parser')
const mongoose = require('mongoose')
const addbot = require('./models/bots')
const member = require('./models/users')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const PORT = process.env.PORT || 3000 //i changed the port to 3000 since 5000 was causing errors

/*
* @param1 {string}: Required, message text in String format.
* 
* @param2 {function | Object}: Optional, a callback function when the notification element has been clicked. Or, extend the initialize options with new options for each notification element.
*
* @param3 {Object}: Optional, extend the initialize options with new options for each notification element (if the second parameter is a callback function).
*/

// Client (Bot) Ready Event
client.once('ready', () => {
  client.user.setActivity('? | Discord Lists Beta', { type: 'WATCHING' });
    console.log('[EVENT] Bot Is Online!\n[EVENT] Block Chain Is Online')
})

// Botlist Website
app.use(parser.urlencoded({ extended: false })) // Encoding
app.use(parser.json()) // Parsing json objects
app.set('view engine', 'ejs') // Set the view engine as ejs
app.use(express.static(__dirname + '/public'));
passport.serializeUser(function(user, done){
        done(null, user)
});

passport.deserializeUser(function(obj, done){
        done(null, obj)
});

// Scopes
var scopes = ['identify', 'email', 'guilds']
var prompt = 'consent'

// SECRETS FOR CALLBACK SESSION (STORE THEM IN ENV FILE)
passport.use(new Strategy({
        clientID: '786125193394651166',
        clientSecret: '2TY8uwcp2Cmv7bxvczy72I5BrZgelMnQ',
        callbackURL: 'https://a-botlist-without-a-name.crazybotboy.repl.co/api/callback',
        scope: scopes,
        prompt: prompt,
}, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
                return done(null, profile)
        });
}));

// Storing current session (Cookies)
app.use(session({
        secret: '%#AIN*AFFFFAF%%%OJOJ#@#$$%^!$%^^%*^%#*&$%*$@#$$#@%$@#@#$@#$$#!@!$#!@%$%!^!##^*$%!$%%$##$$#!!~~$#@%#$^!',
        resave: false,
        saveUninitialized: false
}));

app.use(passport.initialize()) // Using passport
app.use(passport.session()) // Using session

// Main Page
app.get('/', async function(req, res){
        const login_logout = req.isAuthenticated()
        const verified_bots = await addbot.find({ state: 'verified' }).limit(2)
        const random_bot = await addbot.find({ state: 'verified' }).limit(1)
        const certified_bots = await addbot.find({ certification: 'certified' })
        console.log(random_bot)
        res.render('index', {
                verified_bots: verified_bots,
                certified_bots: certified_bots,
                random_bot: random_bot,
                login_logout: login_logout
        })
})

app.get('/bots', (req,res)=>{
  res.redirect('/')
})

// Login with Discord
app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {})

// Callback the user
app.get('/api/callback',
  passport.authenticate('discord', { failureRedirect: '/' }), async function(req, res) { res.redirect('/user/@me')
  client.channels.cache.get('829587315516112948').send(
        new Discord.MessageEmbed()
        .setTitle('Login Detected')
        .setColor('GREEN')
        .setDescription(`\`${req.user.username}\` just logged into the site.`)
        .setTimestamp()
  )
});

//Logging out the user
app.get('/logout', function(req, res) {
        req.logout()
        res.redirect('/')
})

// System check run
app.get('/info', checkAuth, async function(req, res){
       res.sendStatus(200)
})

// Redirecting error header to ejs page
app.get('/error', function(req, res){
        const login_logout = req.isAuthenticated()
        res.render('error',{
                req:req,
                login_logout: login_logout
        })
})

// Redirecting...
app.get('/success', function(req, res){
        const login_logout = req.isAuthenticated()
        res.render('success', {
		login_logout
	})
})

//Redirecting...
app.get('/partners', function(req, res){
        const login_logout = req.isAuthenticated()
        res.render('partners', {
          login_logout
        })
})

// Redirecting...
app.get('/edit/success', function(req, res){
        const login_logout = req.isAuthenticated()
        res.render('editsuccess', {
		login_logout
	})
})

// Redirecting...
app.get('/addbot', checkAuth, async function(req, res){
	const login_logout = req.isAuthenticated()
    res.render('add', {
	    login_logout,
    })
})

// Adding bot to MongoDB if there no such data
app.post('/addbot/success', checkAuth, async function(req, res){
    const info = req.body.id
    const userinfo = req.user
    const token = process.env['TOKEN']
    const fetchuser = async id => {
            const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
                    headers: {
                            Authorization: `Bot ${token}`
                    }
            });
            if(!response.ok) throw new Error(`Error status code: ${response.status}`)
            return await response.json()
    }
    (async () => {
           let data = await fetchuser(info).catch(err => {
              console.error(err)
              res.redirect('/error?code=400&message=bot id is not valid')
           })
           const bot = await addbot.findOne({ botid: req.body.id })
           let avatar = data.avatar
           if(avatar === null) {
                avatar = `https://discord.com/assets/2d20a45d79110dc5bf947137e9d99b66.svg`
           } else {
                avatar = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
           }
           // If there is no bot add it to database
           if(!bot){
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
                        vanity: ''
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
    })()
})

// Getting the bot by ID
app.get('/bot/:botid', async function(req, res){
  const login_logout = req.isAuthenticated()

        const botid = await addbot.findOne({ botid: req.params.botid })
        if(!botid) return res.redirect('/error?code=404&message=invalid bot')
        const deslong = botid.longdes
        res.render('bot',{
                botid: botid,
                deslong: deslong,
                login_logout
        })
})

// Redirecting...
app.get('/bot/:botid/edit', checkAuth, async function(req, res){
  const login_logout = req.isAuthenticated()

        const info = req.user
        const botid = await addbot.findOne({ botid: req.params.botid })
        if(!botid) return res.redirect('/error?code=404&message=invalid bot')
        const owner = botid.botowner
        if(!`${info.username}#${info.discriminator}` === owner){
                res.redirect('/error?code=403&message=You are unauthorized to access this page')
        }

        res.render('edit',{
                botid:botid,
                login_logout: login_logout
        })
})

// Editing bot
app.post('/botedit/success/:botid', checkAuth, async function(req, res){
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
        res.redirect('/bot/' + req.params.botid)
})

// Redirecting...
app.get('/bot/:botid/delete', checkAuth, async function(req, res){
  const login_logout = req.isAuthenticated()

        const info = req.user
        const botid = await addbot.findOne({ botid: req.params.botid })
        if(!botid) return res.redirect('/error?code=404&message=invalid bot id')
        const owner = botid.botowner
        if(!`${info.username}#${info.discriminator}` === owner) return res.redirect('/error?code=403&message=your are unauthorized to access this page')
        res.render('delete', {
                botid: botid,
                login_logout: login_logout
        })
})

// Deleting a bot
app.post('/bot/delete/:botid', async function(req, res) {
  const login_logout = req.isAuthenticated()

        if(req.body.DELETE === 'DELETE'){
        await addbot.findOneAndRemove(
                {
                        botid: req.params.botid
                }
        ),res.redirect('/user/me')} else {
                res.redirect('/error?code=403&message=you are unauthorized to delete the bot until you type DELETE in the text area')
        }
})

//Vanity URL 
app.get('/bot/x/:vanity', async function(req, res) {
  const login_logout = req.isAuthenticated()

        const vanity = await addbot.findOne({ vanity: req.params.vanity })
        const botid = vanity
        if(vanity){
                res.render('bot', {
                        botid: vanity,
                        deslong: vanity.longdes,
                        login_logout: login_logout
                })
        }
})

app.get('/bot/:botid/certification', checkAuth, async function(req, res){
        const botid = await addbot.findOne({ botid: req.param.botid })
        if(!botid){
                res.redirect('/error?code=404&message=We cannot find a bot with that ID')
        }
        res.render('certification', {
                botid: botid
        })
})

//Voting API
app.get('/bot/:botid/vote', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

        const botid = await addbot.findOne({ botid: req.params.botid })
        res.render('vote', {
                botid: botid
        })
})

app.post('/bot/vote/:botid', checkAuth, async function(req, res) {
  const login_logout = req.isAuthenticated()

        const user = await member.findOne({ username: `${req.user.username}#${req.user.discriminator}` })
        const bot = await addbot.findOne({ botid: `${req.params.botid}` })
        await user.findOneAndUpdate(
                {
                       user: user.username 
                },
                { 
                        votebot: `${bot}`
                }
        )
})

// My Profile Data
app.get('/user/@me', checkAuth, async function(req, res){
        const user = req.user
        const login_logout = req.isAuthenticated()
        const me = await member.findOne({ username: `${req.user.username}#${req.user.discriminator}` })
        if(!me){
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
        res.render('me', {
                bots: bots,
                user: user,
                login_logout: login_logout
        })
})

app.get('/user/:userid', async function(req, res) {
        const user = await member.findOne({ userid: req.params.userid })
        const bots = await addbot.find({ ownerid: req.params.userid })
        if(!user){
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
app.get(['/invite', '/join'], async function(req, res){
  res.redirect("https://discord.gg/3sdkRuk63p")
})

app.get('/terms', async function(req, res){
  res.redirect("https://github.com/Discord-Lists/Terms-Of-Service")
})

app.get('twitter', async function(req, res){
  res.redirect('https://twitter.com/DiscordLists100')
})

app.get('/github', async function(req, res){
  res.redirect('https://github.com/Discord-Lists')
})
//Partnerships: 
//Pages:
app.get('/partners/page/crazytech', async function(req, res){
    res.render('partnerships/crazytech-development')
})
//Redirecting:
app.get('/partners/invite/crazytech', async function(req, res){
  res.redirect('https://discord.gg/DD4QG65H6V')
})
// API
app.get('/api', function(req, res) {
        res.json({"code": "200", "message": "api endpoint"})
})

app.post('/api/:botid/stats', async function(req, res) {
        const bot_data = await addbot.findOne({ botid: req.params.botid })
        if(!bot_data) return res.json({ "code": "404", "message": "bot not found" })
        let token = req.header('Authorization')
        if(!token) return res.json({ "code": "401", "message": "client token not found on authorization" })
        if(!req.params.botid) return res.json({ "code": "403", "message": "you must enter your bot id" })
        const data = await addbot.findOne({ bottoken: token })
        if(!data) return res.json({ "code": "404", "message": "token not found" })
        if(bot_data){
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
        if(!botid) return res.json({ "code": "404", "message": "bot not found" })
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

// Discord OAuth2 Check
function checkAuth(req, res, next) {
        if(req.isAuthenticated()) return next()
        res.redirect('/login')
}

//API Function
function makeAPI(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
}

// Starting Express Server With PORT 5000
app.listen(PORT, async function(err){
        await mongoose.connect('mongodb+srv://Admin:Admin1234@new-bot-list.w0s2g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
                useNewUrlParser: true,
                useUnifiedTopology: true
        }).then(console.log('Successfully connected to the mongoDB database'))
        if(err) console.error(err)
        console.log('Listening at https://localhost:5000')
})

//Botlist bot
const PREFIX = '?'
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
}

client.on('message', async message => {

        if(!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        if(!client.commands.has(command)) return;
  
        try {
                client.commands.get(command).execute(client, message, args)
        } catch (err){
                console.error(err)
                message.channel.send({
                        embed:{
                                color:'RED',
                                description: 'There was an error on our end. Please try again later'
                        }
                })
        }
})

client.login(config.token)