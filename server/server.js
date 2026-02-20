
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

    if(isMatch){
        res.status(200).json({
            username: user.username,
            email: user.email,
        })
    }else {
        res.status(401).send('Неверный Email или пароль');
    }
    }catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера при входе');
    }
    
})