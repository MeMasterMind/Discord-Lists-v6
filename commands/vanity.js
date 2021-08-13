const Botinfo = require('../models/bots')

module.exports = {
    name:'vanity',
    description: 'Create a vanity URL for the bot',

    async execute(client, message, args){
        if(!args[0]){
            message.channel.send({
                embed:{
                    color:'RED',
                    descrition:'You must give a BotID'
                }
            })
            return
        }
        const channel = client.channels.cache.get(process.env.LOGS_CHANNEL)
        if(!args[1]){
            message.channel.send({
                embed:{
                    color:'RED',
                    description:'You must type a vanity for your bot'
                }
            })
            return
        }
        const botowner = await Botinfo.findOne({ botid: args[0] })
        if(!botowner.ownerid === message.author.id){
            message.channel.send({
                embed:{
                    color:'RED',
                    description: `You are not the owner of this bot.`
                }
            })
            return
        }
        const bot = await Botinfo.findOne({ vanity: args[1] })
        if(bot){
            message.channel.send({
                embed:{
                    color:'RED',
                    description:'There is a vanity already with that name'
                }
            })
            return
        }
        await Botinfo.findOneAndUpdate(
            {
                botid: args[0]
            },
            {
                vanity: args[1]
            }
        )
        channel.send({
            embed:{
                color:'BLUE',
                description: `<@${args[0]}> Got a new vanity.\n\nVanity created by: <@${message.author.id}>`
            }
        })
        message.channel.send({
            embed:{
                color:'GREEN',
                descripion:`Success. Your vanity link is ready at https://localhost:5000/x/${args[1]}`
            }
        })
    }
}