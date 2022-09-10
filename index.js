const Discord = require('discord.js')
const client = new Discord.Client({
    intents: 32767
})
const tw = require('@fortune-inc/tw-voucher')
const config = require('./config/config.json')
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const express = require('express')
const app = express();
const port = 8080

app.get('/' , (req,res) => res.send('Working!'))
app.listen( port , () => 
  console.log(`Hee หอม`)
);


let commands = [];
fs.readdir('commands', (err, files) => {
    if (err) throw err;
    files.forEach(async (f) => {
        try {
            let props = require(`./commands/${f}`);
            commands.push({
                name: props.name,
                description: props.description,
                options: props.options
            });
        } catch (err) {
            console.log(err);
        }
    });
});
client.on('interactionCreate', async (interaction) => {
	if (interaction.type != 2) return;
    fs.readdir('commands', (err, files) => {
        if (err) throw err;
        files.forEach(async (f) => {
            let props = require(`./commands/${f}`);
            if (interaction.commandName.toLowerCase() === props.name.toLowerCase()) {
                try {
                    if ((props?.permissions?.length || [].length) > 0) {
                        (props?.permissions || [])?.map(perm => {
                            if (interaction.member.permissions.has(config.permissions[perm])) {
                                return props.run(client, interaction);
                            } else {
                                return interaction.reply({ content: `Missing permission: **${perm}**`, ephemeral: true });
                            }
                        })
                    } else {
                        return props.run(client, interaction);
                    }
                } catch (e) {
                    return interaction.reply({ content: `Something went wrong...\n\n\`\`\`${e.message}\`\`\``, ephemeral: true });
                }
            }
        });
    });
});
const rest = new REST({ version: "9" }).setToken(config.token);
client.once("ready", () => {
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await commands,
            });
            console.log("Successfully reloaded application [/] commands.");
        } catch { };
    })();
});
client.login(config.token)

client.on('ready', () => {
    console.log(client.user.tag)
})


client.on("interactionCreate", async (interaction) => {
         if (interaction.isButton()) {
            if (interaction.customId == "buycode") {
              await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("DARK_VIVID_PINK").setTitle("ราคาบอทยืนยันตัวตน")
              .setDescription(`บอทยืนยันตัวตนปุ่มกด javascript\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377> ราคา30บาท\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>  มีLogwebhook\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>  DMไปหาาคนที่กดยืนยัน\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377> เติมเงินแค่30บาทให้พอดีห้ามเกินห้ามขาด\n\n---------------------------------\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>บอทDM All javascript Dm ไปหาทุกคนตามที่เราสั่ง \n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>ราคา 20B ห้ามเกิน เติมให้พอดี\n\n---------------------------------\n\n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>บอทขายสินค้าอัตโนมัติ \n<a:9717ed45d4924294a66d6264e1d59ca7:993849048249401377>ราคา150฿\nยก SRC`).setImage("https://cdn.discordapp.com/attachments/989580985802821695/990451081463078942/ezgif.com-gif-maker_3.gif")], ephemeral: true}) 
            } else if (interaction.customId == "bankb") {
                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("DARK_VIVID_PINK").setTitle("ซื้อโค๊ตผ่านธนาคาร").setDescription(`<:01:982915035187793981> ดูราคาตามที่บอก\n<:02:982915016644775976> แคปQR code สแกนโอนตามราคา\n <:03:982915052283772938> เอาสลีปไปแจ้งที่แอดมินรอแอดมินให้สินค้าอย่าเร่ง`).setImage("https://cdn.discordapp.com/attachments/982938571545669663/1008342253766443099/IMG_20220814_185150.jpg")], ephemeral: true})
            } else if (interaction.customId == "ซื้อของ") {
            const modal = new Discord.ModalBuilder()
                .setCustomId('topup')
                .setTitle('ซองอังเปา');
            const codeInput = new Discord.TextInputBuilder()
                .setCustomId('codeInput')
                .setLabel("ลิ้งค์ซองอังเปา")
                .setPlaceholder('https://gift.truemoney.com/campaign/?v=xxxxxxxxxxxxxxx')
                .setStyle(Discord.TextInputStyle.Short);
            const codeInputActionRow = new Discord.ActionRowBuilder().addComponents(codeInput);
            modal.addComponents(codeInputActionRow);
            await interaction.showModal(modal);
        }
    }
    if (interaction.type === 5){
        if (interaction.customId === "topup") {
            const codeInput =  interaction.fields.getTextInputValue('codeInput')
            console.log(codeInput)
            if(!codeInput.includes("https://gift.truemoney.com/campaign/?v")) return await interaction.guild.channels.cache.get("1001531178152628355").send({ embeds: [new Discord.EmbedBuilder().setColor("Red").setDescription(`เลิกพยายามเถอะมันดูโง่ไอควาย <@${interaction.user.id}>`)]})
            tw(config.phone, codeInput).then(async re => {
                switch  (re.amount) {
                    case 10:
                        if(interaction.member.roles.cache.has(config.role10)){
                        }else{
                            await interaction.member.roles.add(config.role10)
                        }

                    break;
                    case 20:
                        if(interaction.user.send({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("นี้คือสินค้าของคุณ\n\n<a:938630850025762826:989554246443741195> https://xnxx.com \n\n<a:938630850025762826:989554246443741195>ขอบคุณที่ใช้บริการ").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")]})){
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("ซื้อสินค้าสำเร็จโปรดตรวจสอบDM").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")], ephemeral: true})
                                        await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [
                                        new Discord.EmbedBuilder()
                                        .setDescription(`<@${interaction.user.id}>ซื้อสินค้าสำเร็จ| ชื่อสินค้า: SRCยืนยันปุ่มกด\nได้ส่งสินค้าไปยังแชทส่วนตัวแล้ว`)
                                        .setColor("Green")
                                        .setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")
                                    ]})
                                    }else{
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription(`<@${interaction.user.id}>เติมเงินสำเร็จ จำนวนเงิน ${re.amount}`)], ephemeral: true})
                                    }
                                break;
                                case 30:
                                    if(interaction.user.send({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("นี้คือสินค้าของคุณ\n\n<a:938630850025762826:989554246443741195> https://xnxx.com \n\n<a:938630850025762826:989554246443741195>ขอบคุณที่ใช้บริการ").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")]})){
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("ซื้อสินค้าสำเร็จโปรดตรวจสอบDM").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")], ephemeral: true})
                                        await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [
                                        new Discord.EmbedBuilder()
                                        .setDescription(`<@${interaction.user.id}>ซื้อสินค้าสำเร็จ| ชื่อสินค้า: SRCยืนยันปุ่มกด\nได้ส่งสินค้าไปยังแชทส่วนตัวแล้ว`)
                                        .setColor("Green")
                                        .setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")
                                    ]})
                                    }else{
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription(`<@${interaction.user.id}>เติมเงินสำเร็จ จำนวนเงิน ${re.amount}`)], ephemeral: true})
                                    }
                                break;
                                case 15:
                                    if(interaction.user.send({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("นี้คือสินค้าของคุณ\n\n<a:938630850025762826:989554246443741195> https://xnxx.com \n\n<a:938630850025762826:989554246443741195>ขอบคุณที่ใช้บริการ").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")]})){
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("ซื้อสินค้าสำเร็จโปรดตรวจสอบDM").setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")], ephemeral: true})
                                        await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [
                                        new Discord.EmbedBuilder()
                                        .setDescription(`<@${interaction.user.id}>ซื้อสินค้าสำเร็จ| ชื่อสินค้า: SRCบอทขายสินค้า\nได้ส่งสินค้าไปยังแชทส่วนตัวแล้ว`)
                                        .setColor("Green")
                                        .setImage("https://cdn.discordapp.com/attachments/991453577098821722/1002591981161173032/2156cec2f7858cc0f6893427282b8500.gif")
                                    ]})
                                    }else{
                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription(`<@${interaction.user.id}>เติมเงินสำเร็จ จำนวนเงิน ${re.amount}`)], ephemeral: true})
                                    }
                                break;
                                default:
                                    break;
                                }
                            }).catch(async e => {
                                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Red").setDescription("ลิงค์ผิดหรืออาจมีคนใช้ไปแล้ว")], ephemeral: true})
                            })
                        }
                    };
                })