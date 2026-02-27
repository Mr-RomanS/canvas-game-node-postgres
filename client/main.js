import { translations } from './languages.js';


document.addEventListener('DOMContentLoaded', () => {

const menuBtn = document.getElementById('btn_Menu');
const sideMenu = document.getElementById('sideMenu');
const btnX_Menu = document.getElementById('btnX_Menu');

const langBtn = document.getElementById('langBtn');
const langBtnText = document.getElementById('langBtnText');
const langPopup = document.getElementById('langPopup');
const langRoot = document.getElementById('language_list');

const signUp = document.getElementById('sign_up');
const signIn = document.getElementById('sign_in');
const signUpSuccessfullText = document.getElementById('SignUpSuccessfullText')

const openSignUp = document.getElementById('openSignUp');
const openSignIn = document.getElementById('openSignIn');

const iAgreeText = document.getElementById('iAgreeText')
const themeGrid = document.getElementById('themeGrid');
const rulesBtn = document.getElementById('rulesBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalOkBtn = document.getElementById('modalOkBtn');

const avatarInput = document.getElementById('avatarInput');
const avatarPlayer = document.getElementById('avatarPlayer');

//-----Форма для регистрации аккаунтов.
const signUpForm = document.getElementById('signUpForm');
const loginInputSignUpForm = document.getElementById('loginInputSignUpForm');
const emailInputSignUpForm = document.getElementById('emailInputSignUpForm');
const passwordInputSignUpForm = document.getElementById('passwordInputSignUpForm');

const loginPlayer = document.getElementById('loginPlayer');
const emailPlayer = document.getElementById('emailPlayer');
const warningInCorrectPass = document.getElementById('warningInCorrectPass');

const logoutButton = document.getElementById('logoutButton');
const bthDelete = document.getElementById('bthDelete');
//-----Форма для входа в аккаунт.
const signInForm = document.getElementById('signInForm');
const logInEmailInput = document.getElementById('logInEmailInput');
const logInPasswordInput = document.getElementById('logInPasswordInput');
//-----Форма для смены логина в аккаунт.
const changeNameForm = document.getElementById('changeNameForm');
const newLoginMessage = document.getElementById('newLoginMessage');
const loginPlayers = document.getElementById('loginPlayers');

//-----Форма для смены пароля в аккаунт.
const changePasswordForm = document.getElementById('changePasswordForm');
const oldPassPlayer = document.getElementById('oldPassPlayer');
const newPassPlayer = document.getElementById('newPassPlayer');
const passwordMessage = document.getElementById('passwordMessage');
const togglePassImages = document.querySelectorAll('.toggle-pass');

const modalBody = document.getElementById('modalBody');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');
const modalTitle = document.getElementById('modalTitle');


// Вызываем функцию проверки СРАЗУ при загрузке страницы
const checkAuth = async () => {
    try {
        const response = await fetch('/check-auth');
        
        if (response.ok) {
            const userData = await response.json();

            loginPlayer.textContent = userData.username;
            emailPlayer.textContent = userData.email;

            if (userData.avatarUrl) {
                avatarPlayer.src = userData.avatarUrl;
            }

            isAuthenticated = true;
            
            if (lobbyMenu && lobbyPlayerAkk) {
                lobbyMenu.style.display = 'none';
                lobbyPlayerAkk.style.display = 'block';
                moveThemeCard(true); 
            }
        }
    } catch (err) {
        console.log("Сессия не найдена. Пользователь не авторизован.");
    }
};

checkAuth();

// Глобальная функция перевода
const getTranslation = (key) => {
    const currentLang = localStorage.getItem('lang') || 'en';
    return translations[currentLang][key] || key;
};
/* =========================
  МЕНЮ: открыть/закрыть
   ========================= */
function openMenu() {
  if (!sideMenu || !menuBtn) return;

  sideMenu.classList.add('active');

  btnX_Menu.focus();
}
function closeMenu() {
  if (!sideMenu || !menuBtn) return;
  sideMenu.classList.remove('active');

  menuBtn.focus();
}
function toggleMenu() {
  if (!sideMenu || !menuBtn) return;

  if (sideMenu.classList.contains('active')) {
    closeMenu();
  } else {
    openMenu();
  }
}
/* =========================
   ФОРМЫ: Sign up / Sign in
   ========================= */

function showSignUp() {
  if (!signUp || !signIn) return;
  signUp.classList.add('active');
  signIn.classList.remove('active');
}
function showSignIn() {
  if (!signUp || !signIn) return;
  signIn.classList.add('active');
  signUp.classList.remove('active');
}
showSignIn();

function hideAuthForms() {
  if (signIn) signIn.classList.remove('active');
  if (signUp) signUp.classList.remove('active');
}

  /* =========================
      ЯЗЫК: открыть/закрыть
   ========================= */

function closeLang() {
  if (!langPopup) return;
  langPopup.hidden = true;
}
function toggleLang() {
  if (!langPopup) return;
  langPopup.hidden = !langPopup.hidden;
}

/* =========================
    ВОССТАНОВЛЕНИЕ ЯЗЫКА
   ========================= */

//  Кнопка Language (открыть/закрыть попап)
if (langBtn) {
  langBtn.addEventListener('click', (e) => {
    // чтобы клик не дошёл до document.click (который закрывает попап)
    e.stopPropagation();
    toggleLang();
  });
}
function setLanguage(lang) {
  if (!translations[lang]) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const value = translations[lang][key];
    if (value) {
      el.textContent = value;
    }
  });
}

const savedLang = localStorage.getItem('lang');
const initialLang = savedLang || 'en';
setLanguage(initialLang);

if (langBtnText) {
  langBtnText.textContent = initialLang.toUpperCase() ;
}

// 4) Выбор языка внутри popUp
if (langPopup) {
  langPopup.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;

    const lang = btn.dataset.lang;

    // сохраняем выбор
    localStorage.setItem('lang', lang);

    if (langBtnText) {
  langBtnText.textContent = lang.toUpperCase();
}


    // закрываем попап
    closeLang();

    // здесь ты можешь позже добавить реальную смену языка:
    setLanguage(lang);
  });
}

/* =========================
  ОБРАБОТЧИКИ СОБЫТИЙ
   ========================= */

// 1) Кнопка открытия меню (бургер)
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    toggleMenu();
  });
}

// 2) Кнопка X закрыть меню
if (btnX_Menu) {
  btnX_Menu.addEventListener('click', () => {
    closeMenu();
  });
}
document.addEventListener('click', (e) => {
  if (!sideMenu) return;

  const isMenuOpen = sideMenu.classList.contains('active');
  if (!isMenuOpen) return;

  // если клик НЕ внутри меню И НЕ по кнопке бургер
  if (!sideMenu.contains(e.target) && e.target !== menuBtn) {
    closeMenu();
  }
});

// 5) Открытие формы Sign up
if (openSignUp) {
  openSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    showSignUp();
  });
}
// 6) Открытие формы Sign in
if (openSignIn) {
  openSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    showSignIn();
  });
}
// 7) Клик вне блока языка — закрыть popUp 
document.addEventListener('click', (e) => {
  if (!langRoot) return;

  if (!langRoot.contains(e.target)) {
    closeLang();
  }
});
// 8) Escape — закрыть всё, что “всплывающее”
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // закрыть формы входа/регистрации
  hideAuthForms();

  // закрыть popUp языка
  closeLang();

  // закрыть меню
  closeMenu();
});

const savedBg = localStorage.getItem('bgColor');
function setBodyBackground(color) {
  document.body.style.backgroundColor = color;
  sideMenu.style.backgroundColor = color;
  localStorage.setItem('bgColor', color);
}

function markSelected(color) {
  const buttons = document.querySelectorAll('.themeColor');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.bg === color);
  });
}
// 1) При загрузке: раскрасим кнопки и восстановим выбор
document.querySelectorAll('.themeColor').forEach(btn => {
  // установим цвет квадратика из data-bg
  btn.style.setProperty('--c', btn.dataset.bg);
});
if (savedBg) {
  setBodyBackground(savedBg);
  markSelected(savedBg);
}
// 2) Клик по цвету
if (themeGrid) {
  themeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.themeColor');
    if (!btn) return;

    const color = btn.dataset.bg;
    setBodyBackground(color);
    markSelected(color);
  });
}
// // Функция для переноса блока темы

// function moveThemeCard(isLoggedIn) {
//     const themeCard = document.getElementById('themeCard');
//     const lobbyMenu = document.getElementById('lobbyMenu');
//     const lobbyPlayerAkk = document.getElementById('lobbyPlayerAkk');
    
//     // Элемент, ПЕРЕД которым мы хотим вставить блок в аккаунте
//     const logoutBtn = document.getElementById('logoutButton');
    
//     // Элемент, ПЕРЕД которым мы хотим вернуть блок в обычном меню (например, перед правилами)
//     const rulesBlock = document.getElementById('rules');

//     if (isLoggedIn) {
//         if (lobbyPlayerAkk && logoutBtn) {
//             lobbyPlayerAkk.insertBefore(themeCard, logoutBtn.parentNode); 
//         }
//     } else {
//         if (lobbyMenu && rulesBlock) {
//             lobbyMenu.insertBefore(themeCard, rulesBlock);
//         }
//     }
// }

// -------отображения пароля в виде текст,смена картинки.
function setupPasswordToggle(buttonId, wrapperId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const wrap = document.getElementById(wrapperId);
    if (!wrap) return;

    const input = wrap.querySelector('input[type="password"], input[type="text"]');
    if (!input) return;

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';

    const icon = btn.querySelector('img');
    if (icon) {
  icon.src = isHidden
    ? 'images/menu_icons/eye-solid-full.svg'
    : 'images/menu_icons/eye-slash-solid-full.svg';
}


    input.focus();
  });
}
setupPasswordToggle('btnPassIconUp', 'iconPassUp');
setupPasswordToggle('btnPassIconIn', 'iconPassIn');



// ------Открытие и закрытие модального окна.

function openModalWindow() {
    closeMenu(); 
    modalOverlay.style.display = 'flex';
}

iAgreeText.addEventListener('click', (e) => {
        e.preventDefault();
         openModalWindow();
});
closeModal.addEventListener('click', () =>{
  modalOverlay.style.display = 'none';
})
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    modalDeleteBtn.style.display = 'none';
    modalOkBtn.style.display = 'block';
});

//-------Меняем аватарку внутри аккаунта.----
avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files && avatarInput.files[0];
  if(!file){
    return;
  }
  // FormData — специальный объект для отправки файлов
  const formData = new FormData();
  formData.append('avatar', file);
  
  try{
    const response = await fetch('/upload-avatar', {
      method: 'POST',
      body: formData,// Заголовки Content-Type fetch поставит сам для FormData
    });
    if(response.ok){
      const data = await response.json();
      // Обновляем аватарку на странице ссылкой с сервера
      avatarPlayer.src = data.avatarUrl;
    }else{
      const error = await response.text();
      alert('Ошибка загрузки: ' + error);
    }
  }catch (err) {
        console.error('Ошибка сети:', err);
    }
});


//-------Сохраняем значение из ввода в PostgreSQL.-----
let isAuthenticated = false;

signUpForm.addEventListener('submit', async (event) =>{

  event.preventDefault();

  const username = loginInputSignUpForm.value;
  const email = emailInputSignUpForm.value;
  const password = passwordInputSignUpForm.value;

  try{
    const response = await fetch('/register', {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, email, password}),
    })

    if(response.ok){
      const message = await response.text();
  
      loginPlayer.textContent = username;
      emailPlayer.textContent = email;

      loginInputSignUpForm.value = '';
      emailInputSignUpForm.value = '';
      passwordInputSignUpForm.value = '';

      showSignIn();
      signUpSuccessfullText.style.display = 'block';
      warningInCorrectPass.style.display = 'none';
    }else{
      const errorText = await response.text();
      alert("Ошибка: " + errorText);
    }
  }catch(err){
        console.error("Ошибка сети:", err);
        alert("Не удалось связаться с сервером");
  }

})


//------- Форма  входа в аккаунт.----
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = logInEmailInput.value;
    const password = logInPasswordInput.value;

    // Скрываем старую ошибку перед новым запросом
    warningInCorrectPass.style.display = 'none'; 
    warningInCorrectPass.textContent = '';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // ОЧИЩАЕМ ПОЛЯ ТОЛЬКО ЗДЕСЬ (при успехе)
            logInEmailInput.value = '';
            logInPasswordInput.value = '';

        if (response.ok) {
            const userData = await response.json();

            // Успех: заполняем профиль
            loginPlayer.textContent = userData.username;
            emailPlayer.textContent = userData.email;

            isAuthenticated = true;
            lobbyMenu.style.display = 'none';
            lobbyPlayerAkk.style.display = 'block';
            moveThemeCard(true);

            hideAuthForms(); // Закрываем окно входа

        } else {
            // СЕРВЕР ОТВЕТИЛ ОШИБКОЙ (401, 404 и т.д.)
            warningInCorrectPass.textContent = 'Incorrect E-Mail or Password';
            warningInCorrectPass.style.display = 'block';
        }
    } catch (err) {
        console.error("Ошибка сети:", err);
        warningInCorrectPass.textContent = 'Server is not responding';
        warningInCorrectPass.style.display = 'block';
    }
});

//----- сменa логина в аккаунт.
changeNameForm.addEventListener('submit', async (event) => {
  event.preventDefault();

    const newLogin = loginPlayers.value.trim();
    const currentEmail = emailPlayer.textContent;

    newLoginMessage.textContent = '';

    if(newLogin === ''){
      newLoginMessage.textContent = 'Login cannot be empty';
      newLoginMessage.style.color = 'red';
      return;
    }

    try{
      const response = await fetch('/update-username',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: newLogin,
          email: currentEmail,
        })
      });

      if(response.ok){
        newLoginMessage.textContent = 'Successfully update in database';
        newLoginMessage.style.color = 'green';

        loginPlayer.textContent = newLogin;

        loginPlayers.value = '';
      }else{
        const errorText = await response.text();
        newLoginMessage.textContent = 'Error: ' + errorText;
        newLoginMessage.style.color = 'red';
      }
    }catch(err){
      console.error('Ошибка при смене имени:', err);
      newLoginMessage.textContent = 'Server connection error';
      newLoginMessage.style.color = 'red';
    }
});

//----- сменa пароля в аккаунт.
changePasswordForm.addEventListener('submit', async(event) =>{
  event.preventDefault();

  const oldPass = oldPassPlayer.value;
  const newPass = newPassPlayer.value;
  const currentEmail = emailPlayer.textContent;

  const currentLang = localStorage.getItem('lang') || 'en';

  passwordMessage.textContent = '';

  try{
    const response = await fetch('/update-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        oldPassword: oldPass,
        newPassword: newPass,
        email: currentEmail
      })
    });

    if(response.ok){
      passwordMessage.textContent = getTranslation('pass_success');
      passwordMessage.style.color = 'green';
      oldPassPlayer.value = '';
      newPassPlayer.value = '';
    }else if (response.status === 401) {
      // Прямое указание текста при неверном пароле
      passwordMessage.textContent = getTranslation('pass_err_old');
      passwordMessage.style.color = '#8B1E1E';
    } else {
      // Для всех остальных ошибок (500 и т.д.)
      passwordMessage.textContent = getTranslation('pass_err_fail');
      passwordMessage.style.color = '#8B1E1E';
    }
  }catch(err){
    const currentLang = localStorage.getItem('lang') || 'en';
    passwordMessage.textContent = translations[currentLang]['pass_err_server'];
    passwordMessage.style.color = '#8B1E1E';
  }
})

togglePassImages.forEach(img => {
    img.addEventListener('click', () => {
        const input = img.previousElementSibling; // берём input рядом
        if (input.type === 'password') {
            input.type = 'text';
            img.src = 'images/menu_icons/eye-solid-full.svg';
        } else {
            input.type = 'password';
            img.src = 'images/menu_icons/eye-slash-solid-full.svg';
        }
    });
});

//-------Выходим из аккаунта.--------
logoutButton.addEventListener('click', async () => {
    try {
        // 1. Сообщаем серверу, что мы выходим
        const response = await fetch('/logout', { method: 'POST' });

        if (response.ok) {
            // 2. Если сервер подтвердил выход, сбрасываем состояние
            isAuthenticated = false;


            // 3. Переключаем видимость (твой старый код)
            showSignIn();
            lobbyMenu.style.display = 'block';
            lobbyPlayerAkk.style.display = 'none';
            moveThemeCard(false);

            // Опционально: очищаем поля на экране аккаунта
            loginPlayer.textContent = '';
            emailPlayer.textContent = '';
            warningInCorrectPass.textContent = 'Server is not responding';
            closeMenu();
        } else {
            alert('Ошибка сервера при попытке выйти');
        }
    } catch (err) {
        console.error('Ошибка сети при выходе:', err);
    }
});


// -----Предупреждение о Удаление сохраненных логин и пароля.-----


bthDelete.addEventListener('click', (e) =>{
  if(e){
    modalBody.textContent = getTranslation('confirm_delete');
    modalDeleteBtn.style.display = 'block';
    modalOkBtn.style.display = 'none';
    modalTitle.textContent = '';
    openModalWindow();
    closeMenu();
  }
    
})

// -----Удаление сохраненных логин и пароля.-----
modalDeleteBtn.addEventListener('click', async (e) => {

    try{
      const response = await fetch('/delete-account', {
        method:'DELETE',
      });

      if(response.ok){
        loginPlayer.textContent = '';
        emailPlayer.textContent = '';
        avatarPlayer.src = 'images/menu_icons/circle-user-solid-full.svg';

        isAuthenticated = false;
        lobbyMenu.style.display = 'block';
        lobbyPlayerAkk.style.display = 'none';

        modalBody.textContent = getTranslation('delete_success');
        modalDeleteBtn.style.display = 'none';
        modalOkBtn.style.display = 'none';
        modalTitle.textContent = '';
      }else {
        modalBody.textContent = getTranslation('delete_error');
        modalDeleteBtn.style.display = 'none';
        modalOkBtn.style.display = 'none';
        modalTitle.textContent = '';
        }
    }catch (err) {
        console.error('Network error during deletion:', err);
        modalBody.textContent = getTranslation('pass_err_server');
    }
});


});