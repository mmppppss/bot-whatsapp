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
const db = require("./db.json")
const exec = require('child_process').exec
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
    	const chat = m.key.remoteJid;
    // Group
		const isGroup = m.key.remoteJid.includes("@g.us"); 
    	const from=isGroup ? m.key.participant : chat;
	    const groupMetadata = isGroup ? await client.groupMetadata(chat).catch((e) => {}) : "";
    	const groupName = isGroup ? groupMetadata.subject : "";
		const participants = isGroup ? groupMetadata.participants.map(k => k.id) :[];
		const admins = isGroup ? groupMetadata.participants.map(k =>{return k.admin ? k.id:null; }):[];
		
		const isOwner = config.owner.includes(from.split("@")[0]);
		const isAdmin = admins.includes(from);
    // Push Message To Console
	    let msgLog = body.length > 30 ? `${q.substring(0, 30)}...` : body;

    	if (isCmd && !isGroup) {
    		write(msgLog+" From "+pushname+` [${chat.replace("@s.whatsapp.net", "")}]`, "ylw", 1);
    	} else if (isCmd && isGroup) {
			write(msgLog+" From "+pushname+` [${from.replace("@s.whatsapp.net", "")}]`+" IN " +groupName, "ylw", 1);
    	}
		async function reply(txt){
			await client.sendMessage(chat, { text: txt});
		}
		if(save && isCmd){
			if(isGroup){
				if(!db.groups.map(k => k.id).includes(groupMetadata.id)){
					write("New Group "+groupName, "grn", 1)
					db.groups.push(groupMetadata)
					writeJson("./db.json", db)	
				}
			}
			if(!db.users.map(k => k.id).includes(from)){
				write("New User "+ pushname, "grn", 1)
				db.users.push({"id":from, "name":pushname})
				writeJson("./db.json", db)
			}
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
			a=chat.toString()
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
	tag:(args=[])=>({
    	args,
    	help:"\tMenciona a todos los integrantes de un grupo",
    	run(){
        	if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
            if(isAdmin) client.sendMessage(chat , {text:text, mentions:participants})
        }
    }),
	info:({args=[]})=>({
        args,
		help:"Muestra la informacion del servidor",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
            segundosP=process.uptime()
            const segundos = (Math.round(segundosP % 0x3C)).toString();
            const horas    = (Math.floor(segundosP / 0xE10)).toString();
            const minutos  = (Math.floor(segundosP / 0x3C ) % 0x3C).toString();    
            let time=`${horas} HH, ${minutos} MM, ${segundos} SS`;
	        info="> Online: \t`"+ time +"`\n"+"> RAM: \t`"+Math.round((process.memoryUsage().rss)/1024/1024) + " mb`\n> Node: `"+process.version+"`";
    	    reply(info);
        }
    }),
	demote:(args=[])=>({
        args,
        help:"Degrada a un administrador",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
    	    if(!isAdmin)return 
    	    mention=body.slice(9)
        	var victim=mention+'@s.whatsapp.net'
    	    client.groupParticipantsUpdate(chat,[victim],'demote')
    	    reply('Demote: @'+mention)
        }
    }),
    promote:(args=[])=>({
        args,
        help:"Hace administrador a un usuario",
        run(){
            if(this.args[0]=="-h"){
                reply(this.help)
                return this.help
            }
        	if(!isAdmin)return 
	        mention=body.slice(10)
        	var victim=mention+'@s.whatsapp.net'
	        client.groupParticipantsUpdate(chat,[victim],'promote')
    	    reply('Promote: @'+mention)
        }
    }),
	menu:(args=[])=>({
    	args,
    	help:"Muestra la lista de comandos disponibles",
    	run(){
        	if(this.args[0]=="-h"){
            	reply(this.help)
            	return this.help
            }
            let menutext=""
            for(key in commands){
                help=commands[key]({}).help;
                menutext=menutext.concat(prefix+key+"\t```"+help+"```\n")
            }
            reply(menutext)
        }
    })
}
		if (isCmd) {
			try{
				commands[command](args).run();	
			}catch(e){
				write(e.toString(), "red", 2)
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
        		if(sim>=50){
            		reply("Comando no encontrado\n\nSugerencia:  *"+suggest+"*  "+sim+"%\n\n*"+prefix+"menu*   Para ver todos los comandos" )
            		return
        		}else{
					write("Command: \""+command+"\" not found", "wht", 1)
				}
			}
		}
		if(body.startsWith(">") && isOwner){
        	cmd = body.slice(2);
			try{
				a=await JSON.stringify(eval(cmd),null,'\t')
				reply(a)
			} catch(e){
				reply('[#] '+e)
            	console.log(e)
			}
		}
		if(body.startsWith("$") && isOwner){
	        cmd = body.slice(2);
			exec(cmd, (err, stdout) => {
				if (err) return reply(`[#] ${err}`);
				if (stdout) {
					reply(stdout);
				}
			});
		}
	} catch (err) {
    	//reply(util.format(err), chat);
		write(err, "red", 2)
	}
};

const writeJson = (file, data)=>{
    try{
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return 1;
    } catch(e){
		write(e.toString(), "red", 2)
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
