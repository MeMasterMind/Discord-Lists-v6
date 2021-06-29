const Botinfo = require('../models/bots')
const config = require('../config.json')

module.exports = {
    name:'approve',
    description: 'Approve a bot',

    async execute(client, message, args){
       if(!args[0]){
           message.channel.send({
               embed:{
                   color:'RED',
                   description:'You must type a botid'
               }
           })
           return
       }
       const channel = client.channels.cache.get(config.logs_channel)
       const bot = await Botinfo.findOne({ botid: args[0] })
       if(!bot){
           message.channel.send({
               embed:{
                   color:'RED',
                   description: 'We cannot find that bot id in our system.'
               }
           })
           return
       }
       await Botinfo.findOneAndUpdate(
           {
               botid: `${args[0]}` 
           },
           {
               state: `verified`
           }
       )
       channel.send({
           embed:{
               color:'BLUE',
               description: `<@${args[0]}> approved.\n\nReviewer: <@${message.author.id}>`
           }
       })
       message.channel.send({
           embed:{
               color:'BLUE',
               description:`<@${args[0]}> approved`
           }
       })
    }
}