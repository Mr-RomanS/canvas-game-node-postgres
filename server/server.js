
const express = require('express');// Import the Express library
const path = require('path');// Built-in module for working with paths
const { Client, Pool } = require('pg');// pg — a “translator” for working with the PostgreSQL database.
const bcrypt = require('bcrypt'); // Password encryption library!
const multer = require('multer');// For secure and reliable file uploads in Node.js.
const fs = require('fs');// fs (File System) — allows the server to work with files: read, delete, and create them.
const session = require('express-session');// Allows the server to “recognize” the user between requests by creating a unique session (temporary memory).
const pgSession = require('connect-pg-simple')(session); // Import the session store.

require('dotenv').config();// Loads secret data (passwords, keys) from the .env file into the server’s memory

const { createClient } = require('redis');
const { sendVerificationCode } = require('./services/authService');

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log('Connected to Redis in server.js'));
//  Create an instance of our application (server)
const app = express();
// Specify the port for the server (which "channel" it will broadcast on)
const PORT = process.env.PORT || 3000;

const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Specify the server location for your images, styles, and HTML.
app.use(express.static(path.join(__dirname, '../client')));
//  Allow the server to parse JSON sent by your fetch.
app.use(express.json());


app.use(session({
    store: new pgSession({
        pool: pgPool,                // Database connection pool
        tableName: 'session',        // The name of the table I created
        pruneSessionInterval: 60 * 15, // 15min - How often to check and delete "expired" (old) sessions from the database
    }),
    secret: process.env.SESSION_PASSWORD, // any long string
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        secure: false,// true только если у тебя HTTPS
        // secure: true, // true только если у тебя HTTPS
        // sameSite: 'lax', //Отправляй эту куку, только если запрос идет именно с моего сайта,
        // name: 'my-custom-session-name', //"имя Cookie ярлыка".
        maxAge: 24 * 60 * 60 * 1000, // кука будет жить 1 день
        httpOnly: true
    }
}));


app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json({
            isAuthenticated: true,
            username: req.session.user.username,
            email: req.session.user.email,
            avatarUrl: req.session.user.avatar_url 
        });
    } else {
        res.status(401).json({ 
            isAuthenticated: false, 
            error: 'NOT_AUTHORIZED', 
            message: 'No active session found' 
        });
    }
});


// Verify that the pool can reach the database
pgPool.connect()
    .then(client => {
        console.log('Database connected successfully via Pool');
        client.release(); // Release the connection back to the pool
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);// Stop the server if the database is unavailable
    });

app.post('/register', async (req,res) => {
    const {username, email, password} = req.body;

    try{
        const userExists = await pgPool.query(
            'SELECT * FROM users WHERE  email = $1 OR username = $2',
            [email, username]
        )
        if(userExists.rows.length > 0){
            return res.status(400).json({
                error: 'USER_EXISTS',
                message: 'Username or Email already taken'
            });
        }
        const hash = await bcrypt.hash(password, 10);
        const userData = JSON.stringify({ username, email, password: hash});
        await redisClient.set(`pending_user:${email}`, userData, {EX: 900})

        await sendVerificationCode(email);

        res.status(200).json({
            success: true,
            message: 'Code sent to your email',
        });
    }catch(err){
        console.log('Registration error (Step 1):', err);
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

app.post('/verify-registration', async (req,res)=> {
    const {email, code} = req.body;

    try{
        const saveCode = await redisClient.get(`verify:${email}`);

        if(!saveCode || saveCode !== code){
            return res.status(400).json({
                error: 'INVALIDE_CODE',
                message: 'Wrong or expired verification code'
            });
        }
        const pendingUserData = await redisClient.get(`pending_user:${email}`);
        if(!pendingUserData){
            return res.status(400).json({
                error: 'SESSION_EXPIRED',
                message: 'Registration session expired. Please try again'
            });
        }
        const { username, email: userEmail, password} = JSON.parse(pendingUserData);
        const result = await pgPool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username,userEmail, password]
        );
        const newUser = result.rows[0];

        req.session.user = {
            id: newUser.id,
            username: username,
            email: userEmail,
            avatar_url: null,
        }
        await redisClient.del(`verify:${email}`);
        await redisClient.del(`pending_user:${email}`);

        res.status(201).json({
            success: true,
            message: 'User successfully registred!',
            userId: result.rows[0].id
        });
    }catch(err){
        console.error('Verification error (Step 2):', err);
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

app.post('/resend-code', async (req, res) => {
    const { email } = req.body;
    try {
        const pendingUser = await redisClient.get(`pending_user:${email}`);
        
        if (!pendingUser) {
            return res.status(400).json({ 
                error: 'SESSION_EXPIRED', 
                message: 'Registration expired. Please start over.' 
            });
        }

        //  Send a new code (this will create a new code in Redis for 5 minutes)
        await sendVerificationCode(email); 

        // Extend the TTL (time-to-live) for user data in Redis for another 5 minutes (300 sec)
        // The counter will now reset back to 5 minutes
        await redisClient.expire(`pending_user:${email}`, 300);

        res.json({ success: true, message: 'New code sent!' });
    } catch (err) {
        console.error('Resend error:', err);
        res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user) {
            // User found, checking password
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                // PASSWORD IS CORRECT
                req.session.user = { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email, 
                    avatar_url: user.avatar_url 
                };

                // Send user data back to the client
                res.status(200).json({ 
                    success: true,
                    username: user.username, 
                    email: user.email, 
                    avatar_url: user.avatar_url 
                });
            } else {
                // PASSWORD IS INCORRECT
                console.log("Incorrect password for:", email);
                res.status(401).json({ 
                    error: 'INVALID_PASSWORD', 
                    message: 'Incorrect password' 
                });
            }
        } else {
            // USER NOT FOUND
            res.status(401).json({ 
                error: 'USER_NOT_FOUND', 
                message: 'User with this email not found' 
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            error: 'SERVER_ERROR', 
            message: 'Internal server error during login' 
        });
    }
});

app.post('/update-username', async (req, res) =>{
    try{
        const { newUsername} = req.body;
        const email = req.session.user.email;

        if(!newUsername){
            return res.status(400).json({ 
                error: 'EMPTY_USERNAME', 
                message: 'Username cannot be empty' 
            });
        }

        const queryText = 'UPDATE users SET username = $1 WHERE email = $2';
        const result = await pgPool.query(queryText, [newUsername, email]);

        if(result.rowCount > 0) {
            res.status(200).json({ 
                success: true, 
                message: 'Username updated successfully' 
            });
        }else{
            res.status(404).json({ 
                error: 'USER_NOT_FOUND', 
                message: 'User not found' 
            });
        }
    }catch (err) {
        console.error('Update username error:', err);
        res.status(500).json({ 
            error: 'DATABASE_ERROR', 
            message: 'Error updating database' 
        });
    }
})

//--------Password change.
app.post('/update-password', async (req,res) =>{
    try{
        const { oldPassword, newPassword } = req.body;
        
        if (!req.session.user) {
            return res.status(401).json({ error: 'NOT_AUTHORIZED' });
        }
        const email = req.session.user.email;

        const userResult = await pgPool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if(!isMatch){
            return res.status(401).json({ 
                error: 'INVALID_OLD_PASSWORD', 
                message: 'The provided old password does not match' 
            })
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await pgPool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, email]);

        res.status(200).json({ 
            success: true, 
            message: 'Password has been updated in the database' 
        })
    }catch(err){
        console.error(err);
        res.status(500).json({ 
            error: 'SERVER_ERROR', 
            message: 'Internal error during password update' 
        })
    }
})

//------Storage configuration---- Auto-create folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
//---Image filename creation.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Using the absolute path
    },
    filename: (req, file, cb) => {

        const username = req.session.user ? req.session.user.username : 'unknown';
        const uniqueSuffix = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, username + '-' + uniqueSuffix + extension);
    }
});

// Security filter: images only
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true);
    }else{
        cb(new Error('Invalid file type! Images only.'), false);
    }
};

//----Image size limits.
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
})
// Make the 'uploads' folder public so the browser can load images from it
app.use('/uploads', express.static(uploadDir));

//---Account avatar upload
app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.session.user){
            return res.status(401).json({error: 'AUTH_REQIRED', message:'User not authorizired'});
        }
        if (!req.file){
            return res.status(400).json({error:'FILE_MISSING', message:'No file uploaded or file too large'});
        }

        const userEmail = req.session.user.email;
        const newAvatarUrl = `/uploads/${req.file.filename}`;

        // Searching for the old avatar in the DB
        const userResult = await pgPool.query('SELECT avatar_url FROM users WHERE email =$1', [userEmail]);
        const oldAvatarUrl = userResult.rows[0]?.avatar_url;

        // Delete the old file if it exists
        if (oldAvatarUrl) {
            // Strip the leading slash (/uploads/file.jpg -> uploads/file.jpg)
            const relativePath = oldAvatarUrl.startsWith('/') ? oldAvatarUrl.slice(1) : oldAvatarUrl;
            const oldPath = path.join(__dirname, relativePath);

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log(`Deleted old avatar file: ${oldPath}`);
            }
        }

        // Updating the DB and Session
        await pgPool.query('UPDATE users SET avatar_url = $1 WHERE email = $2', [newAvatarUrl, userEmail]);
        req.session.user.avatarUrl = newAvatarUrl;

        res.status(200).json({ 
            success: true,
            avatarUrl: newAvatarUrl, 
            message: 'Avatar uploaded and database updated' 
        });

    } catch (err) {
        console.error('Upload error details:', err);
        // If it's a Multer error (e.g., file too large), send a user-friendly message
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'FILE_TOO_LARGE', 
                message: 'Image exceeds 5MB limit' 
            });
        }
        res.status(500).json({ 
            error: 'UPLOAD_FAILED', 
            message: 'Internal server error during avatar upload' 
        });
    }
});
//--Account logout.
app.post('/logout', (req, res) => {
// The destroy command completely removes the session from the server's "notebook"
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ 
                error: 'LOGOUT_FAILED', 
                message: 'Could not destroy session' 
            }
            );
        }
        // Clear the cookie in the user's browser
        res.clearCookie('connect.sid'); 
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        }
        );
    });
});
//--Account deletion.
app.delete('/delete-account', async (req, res) => {
    // If there's no session, return 401 and explain the reason
    if(!req.session.user){
        return res.status(401).json({ error: 'Unauthorized: No active session found' });
    }

    const userEmail = req.session.user.email;

    try{
        const userResult = await pgPool.query('SELECT avatar_url FROM users WHERE email = $1', [userEmail]);
        const avatarUrl = userResult.rows[0]?.avatar_url;

        if(avatarUrl){
            const relativePath = avatarUrl.startsWith('/') ? avatarUrl.slice(1) : avatarUrl;
            const fullPath = path.join(__dirname, relativePath);

            if(fs.existsSync(fullPath)){
                fs.unlinkSync(fullPath);
                // This message is in the TERMINAL (on the server)
                console.log(`File deleted: ${fullPath}`);
            }
        }
        
        // Removing the record from the DB
        await pgPool.query('DELETE FROM users WHERE email = $1', [userEmail]);

        // Destroying the session
        req.session.destroy((err) =>{
            if(err){
                console.error('Error while destroying the session:', err);
                // This is what you'll see in the BROWSER (Network tab), if the session doesn't get deleted
                return res.status(500).json({ error: 'Session destruction failed', details: err.message });
            }
            res.clearCookie('connect.sid');

            res.status(200).json({ 
                success: true, 
                message: 'Account and associated files deleted successfully' 
            });
        })
    } catch (err) {
        console.error('Error during the account deletion process:', err);
        // If the database "crashes" or another system error occurs
        res.status(500).json({ 
            success: false, 
            error: 'Server internal error during deletion',
            trace: err.message 
        });
    }
});

//-----Emergency Situations Ministry
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error:'FIRL_TOO_LARGE',
                message: 'File too large! Max 5MB',
            });
        }
    }
    console.error(err.stack);
    res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Something went wrong on the server',
    });
});