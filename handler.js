const {
	BufferJSON,
	WA_DEFAULT_EPHEMERAL,
	generateWAMessageFromContent,
	proto,
	generateWAMessageContent,
	generateWAMessage,
	prepareWAMessageMedia,
	areJidsSameUser,
	getContentType 
} = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const write = require("./console");
const config = require("./config")
const db = require("./db")
const ytdl = require('ytdl-core')
const https = require('https');
const request=require('request')
var save = true;
module.exports = handler = async (m, client) => {
	type=Object.keys(m.message)[0];
    //console.log(type);
    var prefix = '/'; // /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
	try {
		var body =
			type === "conversation"
        	? m.message.conversation
        	: type == "imageMessage"
        	? m.message.imageMessage.caption
        	: type == "videoMessage"
        	? m.message.videoMessage.caption
        	: type == "extendedTextMessage"
        	? m.message.extendedTextMessage.text
        	: type == "buttonsResponseMessage"
        	? m.message.buttonsResponseMessage.selectedButtonId
        	: type == "listResponseMessage"
        	? m.message.listResponseMessage.singleSelectReply.selectedRowId
        	: type == "templateButtonReplyMessage"
        	? m.message.templateButtonReplyMessage.selectedId
        	: type === "messageContextInfo"
        	? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        	: "";
    	const isCmd = body.startsWith(prefix) || body.includes("@"+config.botNumber);
    	const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    	const args = body.trim().split(/ +/).slice(1);
    	const pushname = m.pushName || "No Name";
    	const text = (q = args.join(" "));
    	const arg = body.trim().substring(body.indexOf(" ") + 1);
		const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    	const sender = m.key.remoteJid;
    // Group
		const isGroup = m.key.remoteJid.includes("@g.us"); 
    	const from=isGroup ? m.key.participant : sender;
		const isOwner=config.owner.includes(from);
	    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    	const groupName = m.isGroup ? groupMetadata.subject : "";
    // Push Message To Console
	    let argsLog = body.length > 30 ? `${q.substring(0, 30)}...` : body;

    	if (isCmd && !m.isGroup) {
    		write(argsLog+" From "+pushname+` [${sender.replace("@s.whatsapp.net", "")}]`, "ylw", 1);
    	} else if (isCmd && m.isGroup) {
			write(argsLog+" From "+pushname+` [${sender.replace("@s.whatsapp.net", "")}]`+" IN " +groupName, "ylw", 1);
    	}
		async function reply(txt){
			await client.sendMessage(sender, { text: txt});
		}
	const commands = {
	hola:(args=[])=>({
    	args,
    	help:"Devuelve un saludo",
    	run(){
        	if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
			a=sender.toString()
			b=pushname.toString();
			if(a==="59163388267@s.whatsapp.net"){
				b="amor <3"
			}
            reply('Hola '+b);
        }
    }),
	getmsg:(args=[])=>({
    	args,
    	help:"Devuelve el json del mensaje",
    	run(){
        	if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
            reply(JSON.stringify(m));
        }
    }),

	menu:(args=[])=>({
    	args,
    	help:"Muestra la lista de  comandos disponibles",
    	run(){
        	if(this.args[0]=="-h"){
            	reply(this.help)
            	return this.help
            }
            let menutext=""
            for(key in commands){
                help=commands[key]({}).help;
                console.log(key+"  "+help)
                menutext=menutext.concat("*"+key+"*  "+help+"\n")
            }
            reply(menutext)
        }
    }),
	
	mp3:(args=[])=>({
        args,
        help:"Descarga un audio de youtube",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
        ytmp3(args[0],from,msg, client)
        }
    }),
    mp4:(args=[])=>({
        args,
        help:"Descarga un video de youtube",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
            ytmp4(args[0],from,msg, client)
        }
    }),
    archives:(args=[])=>({
        args,
        help:"Busca un archivo en archive.org",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
         archSearch(args.toString().replaceAll(',',' '),from,msg, client)
        }
    }),
    archivedl:(args=[])=>({
        args,
        help:"Descarga un archivo de archive.org",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
         archDown(args[0],from,msg, client)
        }
    })
}
		if (isCmd) {
			try{
				commands[command](args).run();	
			}catch(e){
				write(e.toString, "red", 2)
				suggest=""
		        porc=100/command.length
        		sim=0
		        for(key in commands){
        	    	d=key.split('')
        			e=command.split('')
            		act=0
            		for(j in d){
                		if(d[j]==e[j]){act+=porc}
            		}
            		if(act>sim){
                		suggest=key
                		sim=act
            		}
        		}
        		if(sim>50){
            		reply("Comando no encontrado\n\nSugerencia:  *"+suggest+"*  "+sim+"%\n\n*"+prefix+"menu*   Para ver todos los comandos" )
            		return
        		}

			}
		}
		if(save){
		}
	} catch (err) {
    	//reply(util.format(err), sender);
		write(err, "red", 2)
	}
};


const ytmp3 = async (Link, fromId, quotedMsg, client) => {
    try {
        let info = await ytdl.getInfo(Link)
        info=info.player_response.videoDetails
        info=`_${info.title}_\n\nby:_${info.author}_ \n\n\n${info.shortDescription}` 
        let mp3File = './download/'+genRandom(4)+'ytdl.mp3'
        console.log('Downloading audio')
        ytdl(Link, { filter: 'audioonly' })
            .pipe(fs.createWriteStream(mp3File))
            .on('finish', async () => {
                await client.sendMessage(fromId, { audio: fs.readFileSync(mp3File), mimetype: 'audio/mpeg' }, { quoted: quotedMsg })
                fs.unlinkSync(mp3File)
            })
   } catch (err) {
        console.log(`[ytmp3 err] ${err}`)
        await client.sendMessage(fromId, { text:"Error :("}, { quoted: quotedMsg })
    }
}

const ytmp4 = async (Link, fromId, quotedMsg, client) => {
    try {
        let info = await ytdl.getInfo(Link)
        info=info.player_response.videoDetails
        info=`_${info.title}_\n\nby:_${info.author}_ \n\n\n${info.shortDescription}` 
        let mp4File = './download/'+ genRandom(4)+'ytdl.mp4'
        console.log('Downloading audio')
        ytdl(Link)
            .pipe(fs.createWriteStream(mp4File))
            .on('finish', async () => {
                await client.sendMessage(fromId, { video: fs.readFileSync(mp4File), gifPlayback: false, mimetype:'video/mp4', caption:info}, { quoted: quotedMsg })
                fs.unlinkSync(mp4File)
            })
    } catch (err) {
        console.log(`[ytmp4] ${err}`)
        await client.sendMessage(fromId, { text:"Error :("}, { quoted: quotedMsg })
    }
}

const archSearch= async(text, fromId, quotedMsg, client)=>{
        let jsonData ={};
        let textData="";
        const search = text
        const urlSearch = `https://archive.org/advancedsearch.php?q=${search}&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=title&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=3&page=1&output=json&callback=callback&save=yes#raw`;
    https.get(urlSearch, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

    response.on('end', () => {
        jsonData=JSON.parse(data.split('"docs":')[1].replace("}})",""))
        for(i of jsonData){

            urlDetails=`https://archive.org/details/${i.identifier}&output=json`
            https.get(urlDetails, (response) => {
                let data2 = '';
                response.on('data', (chunk) => {
                    data2 += chunk;
                });

                response.on('end', () => {
                    textData+=("\n\n*Nombre:* "+i.title+"\n*Descripcion:* "+i.description.substring(0,420)+"\n*Files:*")
                    jsonData2=JSON.parse(data2)
                    for(file in jsonData2.files){
                        textData+=("\n   *FileName:* "+file+"\n   *FileSize:* "+jsonData2.files[file].size+"\n   *Downlink:* https://"+jsonData2.server+jsonData2.dir+file)
                    }

        client.sendMessage(fromId,{ text:textData},{quoted:quotedMsg})
                });
            });
        }

    }).on("error", (err) => {
        client.sendMessage(fromId,{ text:"Error:("+err.message},{quoted:quotedMsg})
    });
})
}
const archDown=async(link,fromId, quotedMsg, client)=>{
    linkSplit=link.split("/")
    type=linkSplit[linkSplit.length-1].split(".")[1]
    name=linkSplit[linkSplit.length-2]+"."+type

    let dest = './download/'+name;
    request(link)
        .pipe(fs.createWriteStream(dest))
        .on('close', () => {
            console.log('Archivo descargado exitosamente.');
            client.sendMessage(fromId,{document:{url:dest}, fileName:name, mimetype:type},{quoted:quotedMsg})
        });
}

const writeJson = (file, data)=>{
    try{
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return 1;
    } catch(e){
        return e;
    }
}
function genRandom(num) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let result = "";
	for (let i = 0; i < num; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
    return result;
}
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
