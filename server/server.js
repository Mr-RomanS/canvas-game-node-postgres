
const express = require('express');// 1. Подключаем библиотеку Express
const path = require('path'); // Встроенный модуль для работы с путями
const { Client } = require('pg');// pg — «переводчик» для работы с базой PostgreSQL.
const bcrypt = require('bcrypt'); // библиотека шифровки пароля!
require('dotenv').config();

// 2. Создаем экземпляр нашего приложения (сервера)
const app = express();

// 3. Указываем серверу порт (на каком "канале" он будет вещать)
const PORT = 3000;

// 4. ГЛАВНОЕ: Указываем серверу, где лежат твои картинки, стили и HTML.
// Мы говорим: "Иди на уровень выше и ищи папку client"
app.use(express.static(path.join(__dirname, '../client')));

// 5. Позволяем серверу понимать JSON, который присылает твой fetch
app.use(express.json());

const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_PASSWORD, // любая длинная строка
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // ставь true только если у тебя HTTPS
        maxAge: 24 * 60 * 60 * 1000 // кука будет жить 1 день
    }
}));


app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.status(401).send('Не авторизован');
    }
});

// 6. Запускаем "прослушку" порта
app.listen(PORT, () => {
    console.log(`Сервер ожил! Слушаю на http://localhost:${PORT}`);
});


const dbClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});
dbClient.connect()
    .then(() => console.log('Связь с базой данных установлена!'))
    .catch(err => console.error('Ошибка подключения к базе:', err));

app.post('/register', async (req, res) =>{
    try{
        const { username,email,password} = req.body;
        const hash = await bcrypt.hash(password, 10);

        const queryText = 'INSERT INTO users (username, email, password_hash) VALUES($1, $2, $3)';
        await dbClient.query(queryText, [username, email, hash]);

        res.status(200).send('Регистрация прошла успешно!');
    }catch(err){
        console.error(err);
        res.status(500).send('Ошибка при записи в базу');
    }
})

app.post('/login', async (req,res)=>{
    try{
        const {email, password} = req.body;

    const userResult = await dbClient.query('SELECT * FROM users WHERE email = $1', [email]);

    if(userResult.rows.length === 0){
        return res.status(401).send('Неверный Email или пароль');
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
    req.session.user = {
        username: user.username,
        email: user.email
    };
    res.status(200).json(req.session.user);
}
    }catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера при входе');
    }
    
})

app.post('/update-username', async (req, res) =>{
    try{
        const { newUsername, email} = req.body;

        if(!newUsername){
            return res.status(400).send('Логин не может быть пустым')
        }

        const queryText = 'UPDATE users SET username = $1 WHERE email = $2';
        const result = await dbClient.query(queryText, [newUsername, email]);

        if(result.rowCount > 0) {
            res.status(200).send('Логин успешно изменен');
        }else{
            res.status(404).send('Пользователь не найден');
        }
    }catch (err) {
        res.status(500).send('Ошибка при обновлении в базе данных');
    }
})

app.get('/check-auth', (req,res)=>{
    if(req.session.user){
        res.status(200).json(req.session.user);
    }else{
        res.status(401).send('Unauthorizired');
    }
})

app.post('/logout', (req, res) => {
    // Команда destroy полностью удаляет сессию из "блокнота" сервера
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).send('Не удалось выйти');
        }
        // Очищаем куку в браузере пользователя
        res.clearCookie('connect.sid'); 
        res.status(200).send('Выход выполнен успешно');
    });
});