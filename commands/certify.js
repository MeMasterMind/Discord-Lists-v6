const Botdata = require('../models/bots')

module.exports = {
    name:'certify',
    description:'Certify a bot',

    async execute(client, message, args){
       if(!args[0]){
           message.channel.send({
               embed:{
                   color:'RED',
                   description:'You must secify a botID'
               }
           })
           return
       }
       const channel = client.channels.cache.get(config.logs_channel)
       const bot = await Botdata.findOne({ botid: args[0] })
       if(!bot){
           message.channel.send({
               embed:{
                   color:'RED',
                   description: 'We cannot find that bot id in our system.'
               }
           })
           return
       }
       await Botdata.findOneAndUpdate(
           {
               botid: `${args[0]}`
           },
           {
               certification: 'certified'
           }
       )
       channel.send({
        embed:{
            color:'BLUE',
            description: `<@${args[0]}> certified.\n\nCertification Give By: <@${message.author.id}>`
        }
       })
       message.channel.send({
           embed:{
               color:'BLUE',
               description: `You have successfully certified <@${args[0]}>`
           }
       })
    }
}