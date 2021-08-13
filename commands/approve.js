const Botinfo = require('../models/bots')

module.exports = {
    name:'approve',
    description: 'Approve a bot',

    async execute(client, message, args){
       if(!args[0]){
           message.channel.send({
               embed:{
                   color:'RED',
                   title:'Error:',
                   description:'You must type a valid bot ID'
               }
           })
           return
       }
       const channel = client.channels.cache.get(process.env.LOGS_CHANNEL)
       const bot = await Botinfo.findOne({ botid: args[0] })
       if(!bot){
           message.channel.send({
               embed:{
                   color:'RED',
                   title:'Error:',
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
               color:'GREEN',
               title:'Bot Approved:',
               description: `<@${args[0]}> approved.\n\nReviewer: <@${message.author.id}>`,
           }
       })
       message.channel.send({
           embed:{
               color:'GREEN',
               description:`<@${args[0]}> was approved`
           }
       })
    }
}