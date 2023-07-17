const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");

module.exports = handler = async (m, client) => {
    type=Object.keys(m.message)[0];
    console.log(type);
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
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = '/'; // /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    let text = (q = args.join(" "));
    const arg = body.trim().substring(body.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    const sender = m.key.remoteJid;
    // Group
    const isGroup = m.key.remoteJid.includes("@g.us");
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = body.length > 30 ? `${q.substring(0, 30)}...` : body;

    if (isCmd2 && !m.isGroup) {
      console.log("[ LOGS ] "+argsLog+" From "+pushname+` [${sender.replace("@s.whatsapp.net", "")}]`);
    } else if (isCmd2 && m.isGroup) {
      console.log("[ LOGS ]"+argsLog+" From "+pushname+` [${sender.replace("@s.whatsapp.net", "")}]`+" IN " +groupName);
    }

    if (isCmd2) {
      switch (command) {
        case "hola":
        case "menu": 
            var date = new Date();
            msg="```CASA DOMOTICA```\n\nMenu\n\n   *Temperatura:* 25\n   *Modo:* Normal\n   *Luces Encendidas:*  Garaje, Sala\n   *Luces Apagadas:* Habitacion\n   *Hora:* "+date.getHours()+":"+date.getMinutes()+"\n\n\nAyuda:\n */menu* : Muestra este mensaje.\n */info* : Muestra informacion General.\n */on* [Garaje, Sala, Habitacion] : Enciende las luces de la habitacion especificada.\n */off* [Garaje, Sala, Habitacion] : Apaga las luces de la habitacion especificada.\n */mode* [normal, alerta, estudio, descanso] : Establece el modo de la casa\n\n\n-------------------";
            reply(msg);
          break;
        case "info":
            var date = new Date();
            msg="```CASA DOMOTICA```\n\nInfo General:\n   *Temperatura:* 25\n   *Luces Encendidas:*  Garaje, Sala\n   *Luces Apagadas:* Habitacion\n   *Hora:* "+date.getHours()+":"+date.getMinutes();
            reply(msg)
        break;
        case "off":
            reply("Luz "+args[0]+" apagada")
        break;
        case "on":
            reply("Luz *"+args[0]+"* encendida")
        break;
    }
    
    function reply(txt){
        client.sendMessage(sender, { text: txt});
    }
  }} catch (err) {
    reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
