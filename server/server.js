
const express = require('express');// 1. Подключаем библиотеку Express
const path = require('path'); // Встроенный модуль для работы с путями
const { Client } = require('pg');// pg — «переводчик» для работы с базой PostgreSQL.
const bcrypt = require('bcrypt'); // библиотека шифровки пароля!
const multer = require('multer'); //для безопасности и надежности загрузки файлов в Node.js.
const fs = require('fs');

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


//------Настройка места хранения---- Авто-создание папки, если её нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Используем абсолютный путь
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

//  Фильтр безопасности: только изображения
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true);
    }else{
        cb(new Error('Недопустимый тип файла! Только изображения.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Ограничение 5 МБ
})

app.use('/uploads', express.static(uploadDir));
app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).send('Не авторизован');
        if (!req.file) return res.status(400).send('Файл не выбран или слишком велик');

        const userEmail = req.session.user.email;
        const newAvatarUrl = `/uploads/${req.file.filename}`;

        // 1. Ищем старую аватарку в БД
        const userResult = await dbClient.query('SELECT avatar_url FROM users WHERE email =$1', [userEmail]);
        const oldAvatarUrl = userResult.rows[0]?.avatar_url;

        // 2. Удаляем старый файл, если он есть
        if (oldAvatarUrl) {
            // Убираем / в начале (/uploads/file.jpg -> uploads/file.jpg)
            const relativePath = oldAvatarUrl.startsWith('/') ? oldAvatarUrl.slice(1) : oldAvatarUrl;
            const oldPath = path.join(__dirname, relativePath);

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log(`Удален старый аватар: ${oldPath}`);
            }
        }

        // 3. Обновляем БД и Сессию
        await dbClient.query('UPDATE users SET avatar_url = $1 WHERE email = $2', [newAvatarUrl, userEmail]);
        req.session.user.avatarUrl = newAvatarUrl;

        res.status(200).json({ avatarUrl: newAvatarUrl });

    } catch (err) {
        console.error('Ошибка загрузки:', err);
        // Если это ошибка Multer (например, файл большой), отправим понятный текст
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('Файл слишком большой! Максимум 5МБ.');
        }
        res.status(500).send('Ошибка сервера при загрузке аватара');
    }
});

app.delete('/delete-account', async (req, res) => {
    if(!req.session.user){
        return res.status(401).send('Вы не авторизованы');
    }

    const userEmail = req.session.user.email;

    try{
        const userResult = await dbClient.query('SELECT avatar_url FROM users WHERE email = $1', [userEmail]);
        const avatarUrl = userResult.rows[0]?.avatar_url;

        if(avatarUrl){
            const relativePath = avatarUrl.startsWith('/') ? avatarUrl.slice(1) : avatarUrl;
            const fullPath = path.join(__dirname, relativePath);

            if(fs.existsSync(fullPath)){
                fs.unlinkSync(fullPath);
                console.log(`Файл удален: ${fullPath}`);
            }
        }
        await dbClient.query('DELETE FROM users WHERE email = $1', [userEmail]);

        req.session.destroy((err) =>{
            if(err){
                console.error('Ошибка при уничтожении сессии:', err);
                return res.status(500).send('Ошибка при выходе из системы');
            }
            res.clearCookie('connect.sid');
            res.status(200).send('Аккаунт успешно удален');
        })
    }catch (err) {
        console.error('Ошибка в процессе удаления аккаунта:', err);
        res.status(500).send('Ошибка сервера при удалении');
    }

});