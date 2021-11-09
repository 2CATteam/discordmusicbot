var Discord = require('discord.js')
var ytdl = require('ytdl-core')
var bot = new Discord.Client()

const consts = require('./const.json')

let connection = null
let dispatcher = null
let queue = []

bot.on('ready', (evt) => {
	console.log('Logged in and ready!')
})

bot.on('message', async function (receivedMessage) {
    if (receivedMessage.content.match(/\/play\s(.+)/i)) {
        let url = receivedMessage.content.match(/^\/play\s(.+)/i)[1]
        queue.push(url)
        if (connection == null) {
            connection = await receivedMessage?.member?.voice?.channel?.join();
            connection.on("disconnect", (err) => {
                if (err) console.error(err)
                dispatcher = null
                connection = null
            })
            play(queue[0])
        }
    } else if (receivedMessage.content.match(/^\/pause/i)) {
        if (dispatcher) {
            if (dispatcher.paused) {
                dispatcher.resume()
                console.log("Resuming")
            } else {
                dispatcher.pause()
                console.log("Pausing")
            }
        } else {
            console.log("Nothing playing")
        }
    } else if (receivedMessage.content.match(/^\/stop/i)) {
        if (connection) {
            connection.disconnect()
            console.log("Disconnecting")
        }
    } else if (receivedMessage.content.match(/^\/clear/i)) {
        if (queue.length > 0) {
            queue = [queue[0]]
        }
    }  else if (receivedMessage.content.match(/^\/skip/i)) {
        if (connection) {
            queue.shift()
            if (queue.length > 0) {
                dispatcher = connection.play(ytdl(queue[0], { filter: 'audioonly' }))
            }
        }
    }
})

function play(url) {
    console.log("Playing", url)
    dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }))
    dispatcher.on('finish', () => {
        console.log('Finished playing!')
        queue.shift()
        if (queue.length > 0) {
            play(queue[0])
        } else {
            connection.disconnect()
        }
    })
    console.log("Playing")
}

bot.login(consts.token)