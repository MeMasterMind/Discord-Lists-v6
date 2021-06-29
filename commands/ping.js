module.exports = {
    name:'ping',
    description: 'Ping command',

    async execute(client, message, args){
        message.channel.send({
            embed:{
                color:'GREEN',
                description: `Pong! \`${client.ws.ping}ms\``
            }
        })
    }
}