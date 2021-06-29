const Botinfo = require('../models/bots')

module.exports = {
    name:'deny',
    description: 'Decline a bot',

    async execute(client, message, args){
        let reason = args[1].slice(" ")
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
       if(reason === undefined) reason = "Unspecified"

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

       await Botinfo.findOneAndDelete(
           {
               botid: `${args[0]}` 
           },
       )
       channel.send({
        embed:{
            color:'RED',
            description: `<@${args[0]}> was denied.\n\nReviewer: <@${message.author.id}>\nReason: ${reason}`
        }
       })
       message.channel.send({
           embed:{
               color:'BLUE',
               description:`<@${args[0]}> declined.\nReason: **${reason}**`
           }
       })
    }
}