const TelegramApi = require("node-telegram-bot-api");
const {loadImage, createCanvas} = require('canvas');
const fs = require("fs");
const express = require("express");
const chrono = require("chrono-node");
const ExcelJS = require("exceljs");
var YandexDisk = require('yandex-disk').YandexDisk;
const getTeg = require("./getTeg");

const dotenv = require("dotenv");
const { FILE } = require("dns");
dotenv.config();

const TOKEN = process.env.TOKEN;
const YAKEY = process.env.YAKEY;
const PORT = process.env.PORT;
const TELEGRAM_LOCAL_SERVER = process.env.TELEGRAM_LOCAL_SERVER === 'true' ? true : false;
const CHANNEL_ID = process.env.CHANNEL_ID;
const CHAT_ID = process.env.CHAT_ID;
const THREAD_ID = process.env.THREAD_ID;

const telegram_bot = () => TELEGRAM_LOCAL_SERVER ? new TelegramApi(TOKEN, {polling: true, baseApiUrl: "http://127.0.0.1:8081"}) : new TelegramApi(TOKEN, {polling: true});
const bot = telegram_bot();
/*const app = express();

app.get('/', function (req, res) {
    console.log(req);
    res.send('Hello World');
})

app.listen(PORT, () => console.log(`server started in potr: ${PORT}`));


bot.setMyCommands([
    {command: '/get_action', description: 'Предложить анонс'}
]);*/

const getAction = async (title) => {
    //const tableAddr = '/home/PashkaKra/Документы/WebProj/BigSquirrelBot/actionsTable.xlsx';
    /*const tableAddr = 'https://disk.yandex.ru/edit/disk/disk%2FactionsTable.xlsx?sk=yc038db9fa2e6136804c0b1aa61f7ffc2';
    await disk.readFile('./actionsTable.xlsx', '1251', (err, data) => {
        console.log("vhhj");
        console.log(data);
        /*const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(data);
        const worksheet = workbook.getWorksheet();
        worksheet.eachRow({includeEmpty: true}, (row, rowNumber) =>{
            console.log(worksheet.getCell(`E${rowNumber}`).value);
        });
    });*/
    
    

    const tableActions = [
        {action: "Настольный теннис", teg: "#настольныйтеннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /(настольн).+(теннис)/i},
        {action: "Пинг-понг", teg: "#настольныйтеннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /(пинг.понг|пингпонг)/i},
        {action: "Бадминтон", teg: "#бадминтон", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /бадминтон/i},
        {action: "Сквош", teg: "#сквош", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /сквош/i},
        {action: "Кроссминтон", teg: "#бадминтон", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /(кроссминтон|спидминтон)/i},
        {action: "Пляжный теннис", teg: "#теннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /(пляжн).+(теннис)/i},
        {action: "Падел-теннис", teg: "#теннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /(падел).+(теннис)/i},
        {action: "Большой теннис", teg: "#теннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /теннис/i},
        {action: "Пиклбол", teg: "#теннис", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /пиклбол/i},
        {action: "Лапта", teg: "#лапта", link: "https://t.me/+6IclAEAzk_c0NTZi", chat: "🏸Ракетки", patterns: /лапт/i},
        {action: "Пляжный волейбол", teg: "#волейбол", link: "https://t.me/+jrN8B0CLicthNzM6", chat: "🏐Мяч", patterns: /(пляжн).+(волейбол)/i},
        {action: "Волейбол", teg: "#волейбол", link: "https://t.me/+jrN8B0CLicthNzM6", chat: "🏐Мяч", patterns: /волейбол/i},
        {action: "Футбол", teg: "#футбол", link: "https://t.me/+jrN8B0CLicthNzM6", chat: "🏐Мяч", patterns: /футбол/i},
        {action: "Баскетбол", teg: "#баскетбол", link: "https://t.me/+jrN8B0CLicthNzM6", chat: "🏐Мяч", patterns: /(баскет|стритбол)/i},
        {action: "Гандбол", teg: "#баскетбол #футбол", link: "https://t.me/+jrN8B0CLicthNzM6", chat: "🏐Мяч", patterns: /гандбол/i},
        {action: "Скалолазание", teg: "#скалолазание", link: "https://t.me/joinchat/UDf0F4Pr9Yyuuawk", chat: "Скалолазы🧗", patterns: /(скалолаз|боулдеринг|трудность)/i},
    ];

    return(tableActions.find((item) => item.patterns.test(title)));
}

const actionMenuInit = () => {
    return({
        type: "",
        title: "",
        date: "",
        time: "",
        location: "",
        price: "",
        participants: "",
        /*lev: {
            beginners: "",
            fan: "",
            pro: ""
        },*/
        details: "",
        photo: "",
    });
}

const getActionMenu = (chatId) => {return({
    //reply_markup: {
        inline_keyboard: [
            //[{text: `Тип мероприятия${actionMenu.type}`, callback_data: 'typeOfAction'}],
            [{text: `*📖 Заголовок мероприятия${actionMenu[`${chatId}`].title}`, callback_data: JSON.stringify({'command': 'titleOfAction'})}],
            [{text: `*📆 Дата${actionMenu[`${chatId}`].date}`, callback_data: JSON.stringify({command: 'dateOfAction'})}],
            [{text: `*⏰ Время${actionMenu[`${chatId}`].time}`, callback_data: JSON.stringify({command: 'timeOfAction'})}],
            [{text: `*📍 Локация${actionMenu[`${chatId}`].location}`, callback_data: JSON.stringify({command: 'locationOfAction'})}],
            [{text: `💸 Стоимость${actionMenu[`${chatId}`].price}`, callback_data: JSON.stringify({command: 'priceOfAction'})}],
            [{text: `👥 Количество участников${actionMenu[`${chatId}`].participants}`, callback_data: JSON.stringify({command: 'numberOfParticipants'})}],
            /*[{text: `🥉 Новички${actionMenu.lev.beginners}`, callback_data: 'beginners'},
            {text: `🥈 Любители${actionMenu.lev.fan}`, callback_data: 'fan'},
            {text: `🥇 Про${actionMenu.lev.pro}`, callback_data: 'pro'},],*/
            [{text: `➕ Дополнительная информация${actionMenu[`${chatId}`].details}`, callback_data: JSON.stringify({command: 'detailsOfAction'})}],
            [{text: `*🏞 Фотообложка${actionMenu[`${chatId}`].photo}`, callback_data: JSON.stringify({command: 'photo'})}],
            [{text: 'Показать превью', callback_data: JSON.stringify({command: 'getPrevie'})}],
        ]
    //}
})}

let actionMenu = new Array();
/*const changeActionState = (chatId, msgId, i, title) => {
    bot.deleteMessage(chatId, msgId);
    if(!Rackets[i].data){
        if(anonsInfo.action){
            let q = Rackets.findIndex(item => item.data == true);
            Rackets[q].data = false;
            Rackets[q].text = anonsInfo.action;
        }
        Rackets[i].data = true;
        Rackets[i].text = title + ' ✅';
        anonsInfo.action = title;
        anonsInfo.link = "https://t.me/+6IclAEAzk_c0NTZi";
        anonsInfo.chatTitle = "🏸Ракетки";
        anonsInfo.categoryTeg = Rackets[i].teg;
        bot.sendMessage(chatId, 'Выбирите вид спорта', getRacketsMenu());
    }
    else{
        Rackets[i].data = false;
        Rackets[i].text = title;
        anonsInfo.action = false;
        anonsInfo.link = false;
        anonsInfo.chatTitle = false;
        anonsInfo.categoryTeg = false;
        bot.sendMessage(chatId, 'Выбирите вид спорта', getRacketsMenu());
    }
}*/

const br = `
`;

//---------------------------------------------------------------------//
/*const changeLevelState = (chatId, msgId, levCat,) => {
    if(actionMenu.lev[levCat] === ""){
        actionMenu.lev[levCat] = ' ✅';
    }
    else{
        actionMenu.lev[levCat] = "";
    }
    bot.deleteMessage(chatId, msgId);
    bot.sendMessage(chatId, 'Заполните данные для анонса', getActionMenu());
    setLevelState();
}

const setLevelState = () => {
    if(actionMenu.lev.beginners === ' ✅'
    && actionMenu.lev.fan === ' ✅'
    && actionMenu.lev.pro === ' ✅'){
        anonsInfo.level = `${br}🏆 Новички, Любители, Профессионалы.`;
    }
    else if(actionMenu.lev.beginners === ' ✅'
    && actionMenu.lev.fan === ' ✅'){
        anonsInfo.level = `${br}🏆 Новички, Любители.`;
    }
    else if(actionMenu.lev.beginners === ' ✅'
    && actionMenu.lev.pro === ' ✅'){
        anonsInfo.level = `${br}🏆 Новички, Профессионалы.`;
    }
    else if(actionMenu.lev.fan === ' ✅'
    && actionMenu.lev.pro === ' ✅'){
        anonsInfo.level = `${br}🏆 Любители, Профессионалы.`;
    }
    else if(actionMenu.lev.beginners === ' ✅'){
        anonsInfo.level = `${br}🏆 Новички.`;
    }
    else if(actionMenu.lev.fan === ' ✅'){
        anonsInfo.level = `${br}🏆 Любители.`;
    }
    else if(actionMenu.lev.pro === ' ✅'){
        anonsInfo.level = `${br}🏆 Профессионалы.`;
    }
    else{
        anonsInfo.level = "";
    }
}*/
//---------------------------------------------------------------------//

const nextButton = (title) => {
    return({
        reply_markup: {
            inline_keyboard: [[{text: title, callback_data: JSON.stringify({command: 'next'})}]]
        }
    })
    
}

const previewMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Редактировать ✏️', callback_data: JSON.stringify({command: 'next'})}, {text: 'Отправить 📤', callback_data: JSON.stringify({command: 'send'})}],
        ]
    }
}

const inWork = (chatId) => {
    return({
        inline_keyboard: [
            [
                {text: 'Принять ✅', callback_data: JSON.stringify({command: 'accept', chatId: chatId})},
                {text: 'Отклонить ❌', callback_data: JSON.stringify({command: 'reject', chatId: chatId})}
            ],
        ]
    });
}

const anonsInfoInit = () => {
    return({
        title: "",
        user: "",
        username: "",
        date: [],
        date_sep: "",
        day: [],
        time: "",
        location: "",
        locCoordinates: "",
        linkedLocation: "",
        price: "Бесплатно",
        participants: "Без ограничений",
        link: "",
        chatTitle: "",
        categoryTeg: "",
        details: '',
        photo: '',
        image: '',
    });
}

let anonsInfo = new Array();
const getText = (chatId) => {
    const NA_FANERE_BOT = "https://t.me/na_fanere_bot";
    const DATE = anonsInfo[`${chatId}`].date.length === 1 ? `${anonsInfo[`${chatId}`].date[0]} (${anonsInfo[`${chatId}`].day[0]})` : `${anonsInfo[`${chatId}`].date[0]} ${anonsInfo[`${chatId}`].date_sep} ${anonsInfo[`${chatId}`].date[1]}`;
    let announce = `<strong>${DATE} - ${anonsInfo[`${chatId}`].title}

🧑‍💼Организатор: @${anonsInfo[`${chatId}`].user} (${anonsInfo[`${chatId}`].username})</strong>

⏰ ${anonsInfo[`${chatId}`].time}
📍 ${anonsInfo[`${chatId}`].linkedLocation}
💸 ${anonsInfo[`${chatId}`].price}
👥 ${anonsInfo[`${chatId}`].participants}` + br + br;

    if(anonsInfo[`${chatId}`].details !== ""){announce += '➕' + anonsInfo[`${chatId}`].details + br + br;}

    announce += `📝Общение: <a href="${anonsInfo[`${chatId}`].link}">${anonsInfo[`${chatId}`].chatTitle}</a>
🎁 <a href="${NA_FANERE_BOT}">Подпишись на обновление</a> 🎁`;

    if(anonsInfo[`${chatId}`].categoryTeg !== ""){announce += br + anonsInfo[`${chatId}`].categoryTeg;}
    return announce;   
}

const access_flag = {
    title: [],
    date: [],
    time: [],
    location: [],
    price: [],
    participants: [],
    details: [],
    photo: [],
}

const day_arr = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

const countDigits = n => {
    for(var i = 0; n >= 1; i++) {
       n /= 10;
    }
    return i;
 }

 const getDate = (text, chatId, i) => {
    let day;
    if(/(\d{2}.\d{2})/.test(text) && !(/(\d{2}\.\d{2}\.\d{2,4})/.test(text))){
        anonsInfo[`${chatId}`].date[i] = text;
        day = new Date(chrono.ru.parseDate(text + `.${new Date().getFullYear()}`)).getDay();
    }
    else{
        const date = new Date(chrono.ru.parseDate(text));
        day = date.getDay();
        const date_zerro = countDigits(date.getDate()) === 2? "" : 0;
        const month_zerro = countDigits(date.getMonth() + 1) === 2? "" : 0;
        anonsInfo[`${chatId}`].date[i] = `${date_zerro}${date.getDate()}.${month_zerro}${date.getMonth() + 1}`;
    }
    anonsInfo[`${chatId}`].day[i] = day_arr[day];
 }

 const checkMember = (userId, action) => {
    const message = `Эта фишечка доступна участникам сообщества\
 "На ФАНере" <a href="https://t.me/${CHANNEL_ID}">подпишитесь</a>💛 Это даст Вам возможность следить\
 за нужными событиями и обновлениями. После подписки на канал, нажми "📝 #Создать_анонс" снова`;
    bot.getChatMember('@'+CHANNEL_ID, userId)
        .then(response => {
            if(response.status === 'member' || response.status === 'administrator' || response.status === 'creator'){
                action();
            }
            else{
                bot.sendMessage(userId, message, {parse_mode: 'HTML'});
            }
        })
        .catch((error) => {
            console.error(error);
            bot.sendMessage(userId, message, {parse_mode: 'HTML'});
        });
 }

 const startText = `
 🔖 <strong>Заполните короткий шаблон, чтобы получился красивый анонс</strong>
 ❗️Поля, отмеченные «*» обязательны для заполнения
     `


const returnToMenu = (chatId) => {
    const success_mes = `Информация успешно записана 🎉`;
    access_flag.title[`${chatId}`] = false;
    access_flag.date[`${chatId}`] = false;
    access_flag.time[`${chatId}`] = false;
    access_flag.location[`${chatId}`] = false;
    access_flag.price[`${chatId}`] = false;
    access_flag.participants[`${chatId}`] = false;
    access_flag.details[`${chatId}`] = false;
    access_flag.photo[`${chatId}`] = false;
    bot.sendMessage(chatId, success_mes);
    bot.sendMessage(chatId, startText, {reply_markup: getActionMenu(chatId), parse_mode: 'HTML'});
}

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if(chatId === userId){
        const msgId = msg.message_id;
        const text = msg.text;
        console.log(msg);

        if(typeof actionMenu[`${chatId}`] !== 'object'){actionMenu[`${chatId}`] = actionMenuInit();}
        if(typeof anonsInfo[`${chatId}`] !== 'object'){anonsInfo[`${chatId}`] = anonsInfoInit();}
        if(text === '📝 #Создать_анонс'/* || text === "/get_action"*/){
            anonsInfo[`${chatId}`] = anonsInfoInit();
            actionMenu[`${chatId}`] = actionMenuInit();
            checkMember(userId, async () => await bot.sendMessage(chatId, startText, {reply_markup: getActionMenu(chatId), parse_mode: 'HTML'}));
        }

        if(access_flag.title[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].title = ' ✅';
            const action_data = await getAction(text);
            anonsInfo[`${chatId}`].title = text;
            if(action_data){
                anonsInfo[`${chatId}`].link = action_data.link;
                anonsInfo[`${chatId}`].chatTitle = action_data.chat;
                anonsInfo[`${chatId}`].categoryTeg = action_data.teg;
            }
            else{
                anonsInfo[`${chatId}`].link = `https://t.me/+nVgj6aipar04MjRi`
                anonsInfo[`${chatId}`].chatTitle = `🏄‍♂️ ФАНерный чат 🏂`;
                anonsInfo[`${chatId}`].categoryTeg = "";
            }
            returnToMenu(chatId);       
        }
        if(access_flag.date[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].date = ' ✅';
            anonsInfo[`${chatId}`].date = [];
            anonsInfo[`${chatId}`].date_sep = "";
            if(/( по | до |-)/.test(text)){
                let durDate = text.split(/( по | до |-)/);
                getDate(durDate[0], chatId, 0);
                getDate(durDate[2], chatId, 1);
                anonsInfo[`${chatId}`].date_sep = '-';
            }
            else if(/( и |&|,)/.test(text)){
                let durDate = text.split(/( и |&|,)/);
                getDate(durDate[0], chatId, 0);
                getDate(durDate[2], chatId, 1);
                anonsInfo[`${chatId}`].date_sep = 'и';
            }
            else{
                getDate(text, chatId, 0);
            }
            returnToMenu(chatId);
        }
        if(access_flag.time[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].time = ' ✅';
            anonsInfo[`${chatId}`].time = text;
            returnToMenu(chatId);
        }
        if(access_flag.location[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].location = ' ✅';
            if(msg.entities){
                if(msg.entities[0].type === 'url'){
                    anonsInfo[`${chatId}`].linkedLocation = `<a href="${text.substr(msg.entities[0].offset, msg.entities[0].length)}">${text.substr(0, msg.entities[0].offset)}</a>`;
                    console.log(anonsInfo[`${chatId}`].linkedLocation);
                }
                else if(msg.entities[0].type === 'text_link'){
                    anonsInfo[`${chatId}`].linkedLocation = `${text.substr(0, msg.entities[0].offset)}<a href="${msg.entities[0].url}">${text.substr(msg.entities[0].offset, msg.entities[0].length)}</a>${text.substr(msg.entities[0].offset+msg.entities[0].length, text.length-msg.entities[0].offset+msg.entities[0].length)}`;
                    console.log(anonsInfo[`${chatId}`].linkedLocation);
                }
                else{console.log(msg.entities);}
            }
            else{
                anonsInfo[`${chatId}`].locCoordinates = await getLocCoordinates(text);
                if(anonsInfo[`${chatId}`].locCoordinates){
                    anonsInfo[`${chatId}`].linkedLocation = `<a href="https://yandex.ru/maps/?pt=${anonsInfo[`${chatId}`].locCoordinates}&z=14&l=map">${text}</a>`;
                }
                else{
                    anonsInfo[`${chatId}`].linkedLocation = text;
                }
            }
            anonsInfo[`${chatId}`].location = text;
            returnToMenu(chatId);
        }
        if(access_flag.price[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].price = ' ✅';
            text !== '0' ? anonsInfo[`${chatId}`].price = text : anonsInfo[`${chatId}`].price = "Бесплатно";
            returnToMenu(chatId);
        }

        if(access_flag.participants[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].participants = ' ✅';
            text !== '0' ? anonsInfo[`${chatId}`].participants = text : anonsInfo[`${chatId}`].participants = "Без ограничений";
            returnToMenu(chatId);
        }

        if(access_flag.details[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            actionMenu[`${chatId}`].details = ' ✅';
            anonsInfo[`${chatId}`].details = text;
            returnToMenu(chatId);
        } 
    }

});

const getPhoto = async (chatId) => {
    let koef = 1;
    if(anonsInfo[`${chatId}`].title.length > 14 && anonsInfo[`${chatId}`].title.length < 29){koef = 1 - (anonsInfo[`${chatId}`].title.length-14)*0.0265;}
    const image = anonsInfo[`${chatId}`].image;
    FILE_PATH = TELEGRAM_LOCAL_SERVER ? image.file_path : `https://api.telegram.org/file/bot${TOKEN}/${image.file_path}`;
    const Img1 = await loadImage(FILE_PATH);
    const Img2 = await loadImage(`src/public/logo/logo.png`);
    const width = Img1.width;
    const height = Img1.height;
    const k = (height - width)+width*14/100;
    const canvas = createCanvas(width, height+width*14/100);
	const context = canvas.getContext('2d');
	context.drawImage(Img1, 0, 0, width, height);
    context.drawImage(Img2, 0, k, width, width);
	context.fillStyle = "#e85d17";

    context.font = `${width*koef/18}pt Ralev001`;
	context.fillText(anonsInfo[`${chatId}`].title, 25, height-koef+width/10);

    context.fillStyle = "white";
    if(anonsInfo[`${chatId}`].date_sep === ""){
        context.font = `${width/17}pt Ralev001`;
	    context.fillText(anonsInfo[`${chatId}`].date[0], width/1.29, height+width*0.08);
    }
    else{
        context.font = `${width/20}pt Ralev001`;
		context.fillText(anonsInfo[`${chatId}`].date[0], width/1.24, height+width*0.03);
		context.fillText(anonsInfo[`${chatId}`].date[1], width/1.24, height+width*0.105);
		if(anonsInfo[`${chatId}`].date_sep === 'и'){
			context.fillText('и', width/1.31, height+width*0.06);
		}
		else{
			context.fillText('[', width/1.29, height+width*0.06);
		}
	}

    const imgBuffer = canvas.toBuffer('image/jpeg');
    const EDITED_PHOTO = image.file_path.split(`/home/telegram/tg-files/${TOKEN}`).join('src/public');
    anonsInfo[`${chatId}`].photo = TELEGRAM_LOCAL_SERVER ?  EDITED_PHOTO : `src/public/${image.file_path}`;
	fs.writeFileSync(anonsInfo[`${chatId}`].photo, imgBuffer);
}

bot.on('photo', async msg => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if(chatId === userId){
        const msgId = msg.message_id;
        const success_mes = `Фотография успешно загружена 🎉`;

        if(typeof actionMenu[`${chatId}`] !== 'object'){actionMenu[`${chatId}`] = actionMenuInit();}
        if(typeof anonsInfo[`${chatId}`] !== 'object'){anonsInfo[`${chatId}`] = anonsInfoInit();}

        if(access_flag.photo[`${chatId}`]){
            bot.deleteMessage(chatId, msgId-1);
            const width = msg.photo[msg.photo.length-1].width;
            const height = msg.photo[msg.photo.length-1].height;
            if(width/height > 1.2){
                const photoId = msg.photo[msg.photo.length-1].file_id;
                actionMenu[`${chatId}`].photo = ' ✅';
                anonsInfo[`${chatId}`].image = await bot.getFile(photoId);
                anonsInfo[`${chatId}`].photo = 1;
                returnToMenu(chatId);
            }
            else{
                bot.sendMessage(chatId, `⛔️Вы загрузили "вертикальную" фотографию, она будет плохо смотреться в анонсе. Пожалуйста выберите в горизонтальном разширении🙏`, nextButton('Вернуться ⬅️'));
            }
        }
    }
})

const getLocCoordinates = async (adr) => {
    const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YAKEY}&geocode=${adr.replace(" ", "+")}&format=json`);
    const data = await res.json();
    if(data.response.GeoObjectCollection.featureMember[0]){
        const coord = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.replace(" ", ",");
        return coord;
    }
    else return false;
}

let dataId;
     
bot.on('callback_query', async msg => {
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const data = JSON.parse(msg.data);
    const msgId = msg.message.message_id;
    if(chatId === userId){
        const photoText = `🖼 Загрузите фотографию для абложки анонса.
Формат фото: горизонтальное (При необходимости обрежьте поля)`;
        const sendMess = `📭 Анонс отправлен на модерацию, после одобрения он появится в нашем <a href="https://t.me/Na_Fanere">канале</a>.
❗️В случае возникновения вопросов, обращайтесь к @Katran1`;
        if(typeof actionMenu[`${chatId}`] !== 'object'){actionMenu[`${chatId}`] = actionMenuInit();}
        if(typeof anonsInfo[`${chatId}`] !== 'object'){anonsInfo[`${chatId}`] = anonsInfoInit();}
        
        if(anonsInfo[`${chatId}`].user === "") {anonsInfo[`${chatId}`].user = msg.from.username;}
        if(anonsInfo[`${chatId}`].username === "") {anonsInfo[`${chatId}`].username = msg.from.first_name;}
        switch(data.command){
            case '2/cmd/announce_create':
                anonsInfo[`${chatId}`] = anonsInfoInit();
                actionMenu[`${chatId}`] = actionMenuInit();
                checkMember(userId, async () => await bot.sendMessage(chatId, startText, {reply_markup: getActionMenu(chatId), parse_mode: 'HTML'}));
                break;
            case 'next':
                bot.deleteMessage(chatId, msg.message.message_id);
                access_flag.title[`${chatId}`] = false;
                access_flag.date[`${chatId}`] = false;
                access_flag.time[`${chatId}`] = false;
                access_flag.location[`${chatId}`] = false;
                access_flag.price[`${chatId}`] = false;
                access_flag.participants[`${chatId}`] = false;
                access_flag.details[`${chatId}`] = false;
                access_flag.photo[`${chatId}`] = false;
                //actionMenu.title = anonsInfo.title ? ' ✅' : '';
                //actionMenu.photo = anonsInfo.photo ? ' ✅' : '';
                bot.sendMessage(chatId, startText, {reply_markup: getActionMenu(chatId), parse_mode: 'HTML'});
                break;
            case 'titleOfAction': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Введите название мероприятия', nextButton('Вернуться ⬅️'));
                access_flag.title[`${chatId}`] = true;
                break;
            case 'dateOfAction': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите дату проведения мероприятия', nextButton('Вернуться ⬅️'));
                dataId = msgId;
                access_flag.date[`${chatId}`] = true;
                break;
            case 'timeOfAction': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите время проведения мероприятия', nextButton('Вернуться ⬅️'));
                access_flag.time[`${chatId}`] = true;
                break;
            case 'locationOfAction': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите место проведения мероприятия', nextButton('Вернуться ⬅️'));
                access_flag.location[`${chatId}`] = true;
                break;
            case 'priceOfAction': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите стоимость участия в мероприятии', nextButton('Вернуться ⬅️'));
                access_flag.price[`${chatId}`] = true;
                break;
            case 'numberOfParticipants': 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите количество участников', nextButton('Вернуться ⬅️'));
                access_flag.participants[`${chatId}`] = true;
                break;
            /*case 'beginners': 
                changeLevelState(chatId, msgId, 'beginners');
                break;
            case 'fan': 
                changeLevelState(chatId, msgId, 'fan');
                break;
            case 'pro': 
                changeLevelState(chatId, msgId, 'pro');
                break;*/
            case 'detailsOfAction':
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, 'Укажите дополнительную информацию к анонсу', nextButton('Вернуться ⬅️'));
                access_flag.details[`${chatId}`] = true;
                break;
            case 'photo':
                access_flag.photo[`${chatId}`] = true; 
                bot.deleteMessage(chatId, msgId);
                bot.sendMessage(chatId, photoText, nextButton('Вернуться ⬅️'));
                break;
            case 'getPrevie':
                checkMember(userId, async () => {
                    if(anonsInfo[`${chatId}`].photo !== ""  
                    && anonsInfo[`${chatId}`].title !== ""
                    && anonsInfo[`${chatId}`].date !== ""
                    && anonsInfo[`${chatId}`].time !== ""
                    && anonsInfo[`${chatId}`].location !== ""){
                        bot.deleteMessage(chatId, msgId);
                        await getPhoto(chatId);
                        await bot.sendPhoto(chatId, fs.readFileSync(anonsInfo[`${chatId}`].photo), {caption: await getText(chatId), parse_mode: 'HTML'});
                        await bot.sendMessage(chatId, "Отправьте анонс на модерацию или продолжите редактирование", previewMenu);
                    }
                    else{
                        bot.sendMessage(chatId, `Заполнены не все обязательные поля!`);
                    }
                });
                break;
            case 'send':
                checkMember(userId, async () => {
                    try{
                        await bot.sendPhoto(CHAT_ID, fs.readFileSync(anonsInfo[`${chatId}`].photo), {caption: await getText(chatId), reply_markup: inWork(chatId), parse_mode: 'HTML', message_thread_id: THREAD_ID});
                        await bot.sendMessage(chatId, sendMess, {parse_mode: 'HTML'});
                    }
                    catch(err){
                        bot.sendMessage(chatId, "⚠️Ой, что-то пошло не так. Напишите пожалуйста @katran1");
                        console.log(err);
                    }
                });
                break;
            default:
                console.log(false1);
                break;
        }
    }
    switch(data.command){
            case 'accept':
                await bot.sendMessage(CHAT_ID, `Анонс обработан @${msg.from.username}`, {message_thread_id: THREAD_ID, reply_to_message_id: msgId});
                await bot.sendMessage(data.chatId, `💛Анонс прошел модерацию и запланирован в канал @na_fanere`);
                break;
            case 'reject':
                await bot.sendMessage(CHAT_ID, `Анонс отклонён @${msg.from.username}`, {message_thread_id: THREAD_ID, reply_to_message_id: msgId});
                await bot.sendMessage(data.chatId, `💔Анонс не прошел модерацию. Просьба уточнить детали у @${msg.from.username}`);
            default:
                console.log("test");
                break;
        }    
});