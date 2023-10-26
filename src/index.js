const TelegramApi = require("node-telegram-bot-api");
const {loadImage, createCanvas} = require('canvas');
const fs = require("fs");
const chrono = require("chrono-node");
const getTeg = require("./getTeg");

const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.TOKEN;
const YAKEY = process.env.YAKEY;

const bot = new TelegramApi(TOKEN, {polling: true});
//const Img = 'https://www.yandex.ru/images/search?pos=0&from=tabbar&img_url=https%3A%2F%2Finfostart.ru%2Fupload%2Fiblock%2Ff0a%2Ff0a7a217efa125f37974167509cbc4cc.jpg&text=node-telegram-bot-api+%D0%BA%D0%B0%D0%BA+%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C+%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8E+%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D1%83+%D0%BF%D0%BE+url+%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B5&rpt=simage&lr=10738';

bot.setMyCommands([
    {command: '/start', description: 'start'},
    {command: '/get_action', description: 'Предложить анонс'}
]);

let table = false;

const getAction = (title) => {
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
    ];

    return(tableActions.find((item) => item.patterns.test(title)));
}

let Rackets = [
    {text: "Настольный теннис", teg: "#Настольныйтеннис", data: false}, {text: "Пинг-понг", teg: "#Настольныйтеннис", data: false},
    {text: "Бадминтон", teg: "#Бадминтон", data: false}, {text: "Сквош", teg: "#Сквош", data: false},
    {text: "Кроссминтон", teg: "#Бадминтон", data: false}, {text: "Пляжный теннис", teg: "#Теннис", data: false},
    {text: "Большой теннис", teg: "#Теннис", data: false}, {text: "Падел-теннис", teg: "#Теннис", data: false},
    {text: "Пиклбол", teg: "#Теннис", data: false}, {text: "Лапта", teg: "#Лапта", data: false}
];

const actionMenu = {
    type: "",
    title: "",
    date: "",
    time: "",
    location: "",
    price: "",
    participants: "",
    lev: {
        beginners: "",
        fan: "",
        pro: ""
    },
    details: "",
    photo: "",
}

const getActionMenu = () => {return({
    reply_markup: {
        inline_keyboard: [
            //[{text: `Тип мероприятия${actionMenu.type}`, callback_data: 'typeOfAction'}],
            [{text: `*📖 Заголовок мероприятия${actionMenu.title}`, callback_data: 'titleOfAction'}],
            [{text: `*📆 Дата${actionMenu.date}`, callback_data: 'dateOfAction'}],
            [{text: `*⏰ Время${actionMenu.time}`, callback_data: 'timeOfAction'}],
            [{text: `*📍 Локация${actionMenu.location}`, callback_data: 'locationOfAction'}],
            [{text: `💸 Стоимость${actionMenu.price}`, callback_data: 'priceOfAction'}],
            [{text: `👥 Количество участников${actionMenu.participants}`, callback_data: 'numberOfParticipants'}],
            [{text: `🥉 Новички${actionMenu.lev.beginners}`, callback_data: 'beginners'},
            {text: `🥈 Любители${actionMenu.lev.fan}`, callback_data: 'fan'},
            {text: `🥇 Про${actionMenu.lev.pro}`, callback_data: 'pro'},],
            [{text: `➕ Дополнительная информация${actionMenu.details}`, callback_data: 'detailsOfAction'}],
            [{text: `*🏞 Фотообложка${actionMenu.photo}`, callback_data: 'photo'}],
            [{text: 'Показать превью', callback_data: 'getPrevie'}],
        ]
    }
})}
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

const changeLevelState = (chatId, msgId, levCat,) => {
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

const br = `
`;

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
}

const getRacketsMenu = () => {return ({
    reply_markup: {
        inline_keyboard: [
            /*[{text: "Настольный теннис", callback_data: 'tableTennis'}, {text: 'Пинг-понг', callback_data: 'ping_pong'}],
            [{text: 'Бадминтон', callback_data: 'badminton'}, {text: 'Сквош', callback_data: 'squash'}],
            [{text: 'Кроссминтон', callback_data: 'crossminton'}, {text: 'Пляжный теннис', callback_data: 'beachTennis'}],
            [{text: 'Большой теннис', callback_data: 'bigTennis'}, {text: 'Падел-теннис', callback_data: 'padel'}], 
            [{text: 'Пиклбол', callback_data: 'picklball'}, {text: 'Лапта', callback_data: 'lapta'}],*/
            [{text: Rackets[0].text, callback_data: 'tableTennis'}, {text: Rackets[1].text, callback_data: 'ping_pong'}],
            [{text: Rackets[2].text, callback_data: 'badminton'}, {text: Rackets[3].text, callback_data: 'squash'}],
            [{text: Rackets[4].text, callback_data: 'crossminton'}, {text: Rackets[5].text, callback_data: 'beachTennis'}],
            [{text: Rackets[6].text, callback_data: 'bigTennis'}, {text: Rackets[7].text, callback_data: 'padel'}], 
            [{text: Rackets[8].text, callback_data: 'picklball'}, {text: Rackets[9].text, callback_data: 'lapta'}],
            [{text: 'Далее ➡️', callback_data: 'next'}],
        ]
    }
})}

/*const numberOfParticipants = {
    reply_markup: {
        inline_keyboard: [
            [{text: '0 ', callback_data: 'tableTennis'}, {text: Rackets[1].text, callback_data: 'ping_pong'}],
        ]
    }
}*/

const nextButton = {
    reply_markup: {
        inline_keyboard: [[{text: 'Далее ➡️', callback_data: 'next'}]]
    }
}

const previewMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Далее ➡️', callback_data: 'next'}, {text: 'Отправить 📤', callback_data: 'send'}],
        ]
    }
}

const startMenu ={
    reply_markup:{
        keyboard: [
            [{text: 'загрузите фотограию'}]
        ]
    }
}

const events_categories = {
    reply_markup: {
        keyboard: [
            [{text: 'Ракетки'}, {text: 'Мяч'}, {text: 'Колёса'}],
            [{text: 'Сёрф и сплавы'}, {text: 'Горнолыжка'}, {text: 'Походы'}],
        ]
    }
}
const rackets_categories = {
    reply_markup: {
        keyboard: [
            [{text: 'Настольный теннис'}, {text: 'Пинг-понг'}, {text: 'Бадминтон'}, {text: 'Сквош'}],
            [{text: 'Большой теннис'}, {text: 'Падел-теннис'}, {text: 'Кроссминтон'}],
            [{text: 'Пляжный теннис'}, {text: 'Пиклбол'}, {text: 'Лапта'}],
        ]
    }
}
const ball_categories = {
    reply_markup: {
        keyboard: [
            [{text: 'Волейбол'}, {text: 'Баскетбол'}, {text: 'Футбол'}],
            [{text: 'Пляжный волейбол'}, {text: 'Гандбол'}]
        ]
    }
}
const anonsInfoInit = () => {
    return({
        title: "",
        user: "",
        username: "",
        date: "",
        time: "",
        location: "",
        locCoordinates: "",
        price: "Бесплатно",
        participants: false,
        link: "",
        chatTitle: "",
        categoryTeg: "",
        level: '',
        details: '',
        photo: '',
    });
}

let anonsInfo = anonsInfoInit();
const getText = () => {
let announce = `<strong>${anonsInfo.date} - ${anonsInfo.title}</strong>
🧑‍💼Организатор: @${anonsInfo.user} (${anonsInfo.username})

⏰ ${anonsInfo.time}
📍 <a href="https://yandex.ru/maps/?pt=${anonsInfo.locCoordinates}&z=14&l=map">${anonsInfo.location}</a>
💸 ${anonsInfo.price}
👥 ${anonsInfo.participants}${anonsInfo.level}` + br + br;

if(anonsInfo.details !== ""){announce += '➕' + anonsInfo.details + br + br;}

announce += `📝Чат: <a href="${anonsInfo.link}">${anonsInfo.chatTitle}</a>
⭐️<strong>Подпишись на уведомления: @na_fanere_bot</strong>`;

if(anonsInfo.categoryTeg !== ""){announce += br + anonsInfo.categoryTeg;}
return announce;   
}

let messId;
let get_title_flag = false;
let get_date_flag = false;
let get_time_flag = false;
let get_location_flag = false;
let get_price_flag = false;
let get_participants_flag = false;
let details_flag = false;
let photo_flag = false;

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const success_mes = `Информация успешно записана 🎉`
    //bot.sendMessage(chatId, `result - ${tableActions[1].patterns.test(text)}`);
    if(text === '/start'){
        bot.sendMessage(chatId, 'Загрузите фотограию');
    }
    if(text === '/get_action'){
    //bot.on('/get_action', async msg => {
    //    messId = msg.message_id;
    //    console.log(`messageId is ${messId}`)
        anonsInfo = anonsInfoInit();
        actionMenu.type = "";
        actionMenu.title = "";
        actionMenu.date = "";
        actionMenu.time = "";
        actionMenu.location = "";
        actionMenu.price = "";
        actionMenu.participants = "";
        actionMenu.lev.beginners = "";
        actionMenu.lev.fan = "";
        actionMenu.lev.pro = "";
        actionMenu.details = "";
        actionMenu.photo = "";
        bot.sendMessage(chatId, 'Заполните данные для анонса', getActionMenu());
        console.log(`message ${text}`);
    //})
         
    }

    if(get_title_flag){
        get_title_flag = false;
        actionMenu.title = ' ✅';
        const action_data = getAction(text);
        anonsInfo.title = text;
        if(action_data){
            anonsInfo.link = action_data.link;
            anonsInfo.chatTitle = action_data.chat;
            anonsInfo.categoryTeg = action_data.teg;
        }
        else{
            anonsInfo.link = `https://t.me/+nVgj6aipar04MjRi`
            anonsInfo.chatTitle = `🏄‍♂️ ФАНерный чат 🏂`;
        }
        bot.sendMessage(chatId, success_mes);        
    }
    if(get_date_flag){
        get_date_flag = false;
        actionMenu.date = ' ✅';
        anonsInfo.date = text;
        bot.sendMessage(chatId, success_mes);
    }
    if(get_time_flag){
        get_time_flag = false;
        actionMenu.time = ' ✅';
        anonsInfo.time = text;
        bot.sendMessage(chatId, success_mes);
    }
    if(get_location_flag){
        get_location_flag = false;
        actionMenu.location = ' ✅';
        //console.log(msg);
        anonsInfo.locCoordinates = await getLocCoordinates(text);
        bot.sendMessage(chatId, anonsInfo.locLink);
        anonsInfo.location = text;
        bot.sendMessage(chatId, success_mes);
    }
    if(get_price_flag){
        get_price_flag = false;
        actionMenu.price = ' ✅';
        anonsInfo.price = text;
        bot.sendMessage(chatId, success_mes);
    }

    if(get_participants_flag){
        get_participants_flag = false;
        actionMenu.participants = ' ✅';
        anonsInfo.participants = text;
        bot.sendMessage(chatId, success_mes);
    }

    if(details_flag){
        details_flag = false;
        actionMenu.details = ' ✅';
        anonsInfo.details = text;
        bot.sendMessage(chatId, success_mes);
    }
});

let Img;

bot.on('photo', async msg => {
    const chatId = msg.chat.id;
    const success_mes = `Фотография успешно загружена 🎉`;
    if(photo_flag){
        photo_flag = false;
        const koef = 1;
        photoId = msg.photo[msg.photo.length-1].file_id;
        const image = await bot.getFile(photoId);
		const FILE_PATH = `https://api.telegram.org/file/bot${TOKEN}/${image.file_path}`;
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
		context.fillText(anonsInfo.title, 25, height-koef+width/10);

        context.fillStyle = "white";
        context.font = `${width/17}pt Ralev001`;
		context.fillText(anonsInfo.date, width/1.29, height+width*0.08);

        const imgBuffer = canvas.toBuffer('image/jpeg');
        anonsInfo.photo = `src/public/${image.file_path}`;
		fs.writeFileSync(anonsInfo.photo, imgBuffer);
        bot.sendMessage(chatId, success_mes);
    }
})

const getLocCoordinates = async (adr) => {
    const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YAKEY}&geocode=${adr.replace(" ", "+")}&format=json`);
    const data = await res.json();
    coord = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.replace(" ", ",");
    return coord;
}
     
bot.on('callback_query', async msg => {
    const chatId = msg.message.chat.id;
    const msgId = msg.message.message_id;
    const data = msg.data;
    
    if(anonsInfo.user === "") {anonsInfo.user = msg.from.username;}
    if(anonsInfo.username === "") {anonsInfo.username = msg.from.first_name;}
    //console.log(chrono.parseDate('An appointment on Sep 12-13'));
    console.log(chrono.ru.parseDate('25.10.23')); 
    console.log(chrono.ru.parseDate('c 25.10 по 23.11')); 
    console.log(msg);
    console.log(data);
    switch(data){
        /*case 'typeOfAction':
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Выбирите вид спорта', getRacketsMenu());
            break;
        case 'tableTennis': changeActionState(chatId, msgId, 0, "Настольный теннис"); break;
        case 'ping_pong': changeActionState(chatId, msgId, 1, "Пинг-понг"); break;
        case 'badminton': changeActionState(chatId, msgId, 2, "Бадминтон"); break;
        case 'squash': changeActionState(chatId, msgId, 3, "Сквош"); break;
        case 'crossminton': changeActionState(chatId, msgId, 4, "Кроссминтон"); break;
        case 'beachTennis': changeActionState(chatId, msgId, 5, "Пляжный теннис"); break;
        case 'bigTennis': changeActionState(chatId, msgId, 6, "Большой теннис"); break;
        case 'padel': changeActionState(chatId, msgId, 7, "Падел-теннис"); break;
        case 'picklball': changeActionState(chatId, msgId, 8, "Пиклбол"); break;
        case 'lapta': changeActionState(chatId, msgId, 9, "Лапта"); break;*/    
        case 'next':
            bot.deleteMessage(chatId, msg.message.message_id);
            //actionMenu.title = anonsInfo.title ? ' ✅' : '';
            //actionMenu.photo = anonsInfo.photo ? ' ✅' : '';
            bot.sendMessage(chatId, `Заполните данные для анонса.${br}Позиции отмеченные символом "*" - обязательны для заполнения!`, getActionMenu());
            break;
        case 'titleOfAction': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Введите название мероприятия', nextButton);
            get_title_flag = true;
            break;
        case 'dateOfAction': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите дату проведения мероприятия', nextButton);
            get_date_flag = true;
            break;
        case 'timeOfAction': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите время проведения мероприятия', nextButton);
            get_time_flag = true;
            break;
        case 'locationOfAction': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите место проведения мероприятия', nextButton);
            get_location_flag = true;
            //let lok = await yaLock();
            break;
        case 'priceOfAction': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите стоимость участия в мероприятии', nextButton);
            get_price_flag = true;
            break;
        case 'numberOfParticipants': 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите количество участников', nextButton);
            get_participants_flag = true;
            break;
        case 'beginners': 
            changeLevelState(chatId, msgId, 'beginners');
            break;
        case 'fan': 
            changeLevelState(chatId, msgId, 'fan');
            break;
        case 'pro': 
            changeLevelState(chatId, msgId, 'pro');
            break;
        case 'detailsOfAction':
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Укажите дополнительную информацию к анонсу', nextButton);
            details_flag = true;
            break;
        case 'photo':
            photo_flag = true; 
            bot.deleteMessage(chatId, msgId);
            bot.sendMessage(chatId, 'Загрузите фотографию для абложки анонса', nextButton);
            break;
        case 'getPrevie':
            //console.log(anonsInfo.photo);
            if(anonsInfo.photo !== ""  
           /*&& anonsInfo.title !== ""
            && anonsInfo.date !== ""
            && anonsInfo.time !== ""
            && anonsInfo.location !== ""*/){
                await bot.sendPhoto(chatId, fs.readFileSync(anonsInfo.photo), {caption: getText(), parse_mode: 'HTML'});
                await bot.sendMessage(chatId, "Отправьте анонс на модерацию или продолжите редактирование", previewMenu);
            }
            else{
                bot.sendMessage(chatId, `Заполнены не все обязательные поля!`);
            }
            break;

        default:
            console.log("test");
    //        bot.deleteMessage(chatId, )
    }
    //bot.sendMessage(chatId, data);
});

/*const getPhoto = () => {
    bot.on('photo', async msg => {
	    const chatId = msg.chat.id;
	    const caption = msg.caption;
        const photoId = msg.photo[msg.photo.length-1].file_id;
        const image = await bot.getFile(photoId);
	    const FILE_PATH = `https://api.telegram.org/file/bot${TOKEN}/${image.file_path}`;
        //const Img1 = await loadImage(FILE_PATH);

        bot.sendMessage(chatId, 'Выбирите категорию мероприятия:', events_categories);
        bot.on('message', async msg => {
            const CHAT_TITLE = msg.text;
            let event_category;
            let chatLink;
            switch(CHAT_TITLE){
                case 'Ракетки':
                    event_category = rackets_categories;
                    chatLink = 'https://t.me/+6IclAEAzk_c0NTZi';
                    break;
                case 'Мяч':
                    event_category = ball_categories;
                    chatLink = 'https://t.me/+jrN8B0CLicthNzM6';
                    break;
            }
            bot.sendMessage(chatId, 'Выбирите мероприятие:', event_category);
            console.log(FILE_PATH);
            bot.on('message', async msg => {
                const text = msg.text;
                const user = msg.from.username;
                console.log(msg);
                let teg = getTeg(text);
                bot.on('message', async msg => {
                    await bot.sendPhoto(chatId, Img, {caption: getText(text, CHAT_TITLE, chatLink, user, teg), parse_mode: 'HTML'});
                });
            });
        });
    });
}*/
