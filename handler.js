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




const writeJson = (file, data)=>{
    try{
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return 1;
    } catch(e){
        return e;
    }
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
