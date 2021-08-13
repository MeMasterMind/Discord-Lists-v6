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
                   title:'Error:',
                   description:'You must type a valid bot ID'
               }
           })
           return
       }
       const channel = client.channels.cache.get(process.env.LOGS_CHANNEL)
       if(reason === undefined) reason = "Unspecified"

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

       await Botinfo.findOneAndDelete(
           {
               botid: `${args[0]}` 
           },
       )
       channel.send({
        embed:{
            color:'RED',
            title:'Bot Denied:',
            description: `<@${args[0]}> was denied.\n\nReviewer: <@${message.author.id}>\nReason: ${reason}`
        }
       })
       message.channel.send({
           embed:{
               color:'BLUE',
               title:'Success:',
               description:`<@${args[0]}> declined.\nReason: **${reason}**`
           }
       })
    }
}