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

const openSignUp = document.getElementById('openSignUp');
const openSignIn = document.getElementById('openSignIn');

const btnPassIconUp = document.getElementById('btnPassIconUp');
const btnPassIconIn = document.getElementById('btnPassIconIn');

const themeGrid = document.getElementById('themeGrid');

const avatarInput = document.getElementById('avatarInput');
const avatarPlayer = document.getElementById('avatarPlayer');
const btnShowPasswordAkk = document.getElementById('btnShowPasswordAkk');

//-----Форма для регистрации аккаунтов.
const signUpForm = document.getElementById('signUpForm');
const loginInputSignUpForm = document.getElementById('loginInputSignUpForm');
const emailInputSignUpForm = document.getElementById('emailInputSignUpForm');
const passwordInputSignUpForm = document.getElementById('passwordInputSignUpForm');

const loginPlayer = document.getElementById('loginPlayer');
const emailPlayer = document.getElementById('emailPlayer');
const warningInCorrectPass = document.getElementById('warningInCorrectPass');
const passwordPlayer = document.getElementById('passwordPlayer');

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

let lastUrl = null;

const savedLang = localStorage.getItem('lang');
const savedBg = localStorage.getItem('bgColor');


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


const initialLang = savedLang || 'en';
setLanguage(initialLang);

if (langBtnText) {
  langBtnText.textContent = initialLang.toUpperCase() ;
}



// 4) Выбор языка внутри попапа
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
// 7) Клик вне блока языка — закрыть попап языка
document.addEventListener('click', (e) => {
  // Если элементов нет — просто ничего не делаем
  if (!langRoot) return;

  // если кликнули НЕ внутри language_list — закрываем
  if (!langRoot.contains(e.target)) {
    closeLang();
  }
});
// 8) Escape — закрыть всё, что “всплывающее”
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // закрыть формы входа/регистрации
  hideAuthForms();

  // закрыть попап языка
  closeLang();

  // закрыть меню
  closeMenu();
});
function setBodyBackground(color) {
  document.body.style.backgroundColor = color;
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
// Функция для переноса блока темы
function moveThemeCard(isLoggedIn) {
    const themeCard = document.getElementById('themeCard');
    const lobbyMenu = document.getElementById('lobbyMenu');
    const lobbyPlayerAkk = document.getElementById('lobbyPlayerAkk');
    
    // Элемент, ПЕРЕД которым мы хотим вставить блок в аккаунте
    const logoutBtn = document.getElementById('logoutButton');
    
    // Элемент, ПЕРЕД которым мы хотим вернуть блок в обычном меню (например, перед правилами)
    const rulesBlock = document.getElementById('rules');

    if (isLoggedIn) {
        if (lobbyPlayerAkk && logoutBtn) {
            // Вставляем тему ПЕРЕД кнопкой логаута
            lobbyPlayerAkk.insertBefore(themeCard, logoutBtn.parentNode); 
            // Используем parentNode, если кнопка лежит внутри <li>, 
            // чтобы блок темы стал отдельным пунктом списка
        }
    } else {
        if (lobbyMenu && rulesBlock) {
            // Возвращаем на место перед правилами в основном меню
            lobbyMenu.insertBefore(themeCard, rulesBlock);
        }
    }
}










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
// Подключаем к двум формам
setupPasswordToggle('btnPassIconUp', 'iconPassUp');
setupPasswordToggle('btnPassIconIn', 'iconPassIn');


//-------Меняем аватарку внутри аккаунта.----
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files && avatarInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return;

  if (lastUrl) URL.revokeObjectURL(lastUrl);

  lastUrl = URL.createObjectURL(file);
  avatarPlayer.src = lastUrl;
});


// Загружаем данные при старте страницы
const savedLogin = localStorage.getItem('login');
const savedEmail = localStorage.getItem('email');
const savedPassword = localStorage.getItem('password');

if (savedLogin) loginPlayer.textContent = savedLogin;
if (savedEmail) emailPlayer.textContent = savedEmail;
if (savedPassword) {
  passwordPlayer.textContent = '*'.repeat(savedPassword.length);
}


//-------Сохраняем значение из ввода в Local Storage.-----
let isAuthenticated = false;

signUpForm.addEventListener('submit', (event) =>{


  event.preventDefault();

  const loginSub = loginInputSignUpForm.value;
  const emailSub = emailInputSignUpForm.value;
  const passwordSub = passwordInputSignUpForm.value;

  localStorage.setItem('login', loginSub);
  localStorage.setItem('email', emailSub);
  localStorage.setItem('password', passwordSub);

  loginPlayer.textContent = loginSub;
  emailPlayer.textContent = emailSub;

  passwordPlayer.textContent = '*'.repeat(passwordSub.length);



  loginInputSignUpForm.value = '';
  emailInputSignUpForm.value = '';
  passwordInputSignUpForm.value = '';

  lobbyMenu.style.display = 'none'
  lobbyPlayerAkk.style.display = 'block'

  isAuthenticated = true;

})


//--------Отображение пароля внутри аккаунта.---
let isPasswordVisible = false;

btnShowPasswordAkk.addEventListener('click', () => {

  const savedPassword = localStorage.getItem('password');
  if (!savedPassword) return;

  const icon = btnShowPasswordAkk.querySelector('img');

  // Меняем состояние
  isPasswordVisible = !isPasswordVisible;

  if (isPasswordVisible) {
    passwordPlayer.textContent = savedPassword;
    if (icon) {
      icon.src = 'images/menu_icons/eye-solid-full.svg';
    }
  } else {
    passwordPlayer.textContent = '*'.repeat(savedPassword.length);
    if (icon) {
      icon.src = 'images/menu_icons/eye-slash-solid-full.svg';
    }
  }

});

//------- Форма  входа в аккаунт.----
signInForm.addEventListener('submit', (event)=>{
  event.preventDefault();


  const logInEmail = logInEmailInput.value;
  const logInPassword = logInPasswordInput.value;

  // Получаем сохранённые данные
  const savedEmail = localStorage.getItem('email');
  const savedPassword = localStorage.getItem('password');

   warningInCorrectPass.textContent = '';

  if(
    logInEmail === savedEmail && 
    logInPassword === savedPassword
  ){
    isAuthenticated = true;
    lobbyMenu.style.display = 'none'
    lobbyPlayerAkk.style.display = 'block'

    moveThemeCard(true);
  }else{
   warningInCorrectPass.textContent = 'Incorrect E-Mail or Password'
  }
  logInEmailInput.value = '';
  logInPasswordInput.value = '';
})


//----- сменa логина в аккаунт.
changeNameForm.addEventListener('submit', (event) => {
  event.preventDefault();

    const newLogin = loginPlayers.value.trim();
    newLoginMessage.textContent = '';
    if (newLogin === '') {
      newLoginMessage.textContent = 'Login cannot be empty'
    }else{
      newLoginMessage.textContent = 'Successfully';
      newLoginMessage.style.color = 'green';
    }
    localStorage.setItem('login', newLogin);
    loginPlayer.textContent = newLogin;
    loginPlayers.value = '';
});

changePasswordForm.addEventListener('submit', (event) =>{
  event.preventDefault();

  const savedPassword = localStorage.getItem('password');

  let oldPass = oldPassPlayer.value;
  let newPass = newPassPlayer.value;

    // Сброс сообщений
  passwordMessage.textContent = '';
  
  if(savedPassword === oldPass){
    localStorage.setItem('password', newPass);
    passwordMessage.textContent = 'Password changed successfully';
    passwordMessage.style.color = 'green';

  }else{
    passwordMessage.textContent = 'Old password is incorrect';
    passwordMessage.style.color = '#8B1E1E';
  }
  oldPassPlayer.value = '';
  newPassPlayer.value = '';
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
logoutButton.addEventListener('click', () => {

  lobbyMenu.style.display = 'block';
  lobbyPlayerAkk.style.display = 'none';

  moveThemeCard(false);
});

// -----Удаление сохраненных логинов и пароля.-----
bthDelete.addEventListener('click', () => {
  localStorage.removeItem('login');
  localStorage.removeItem('email');
  localStorage.removeItem('password');



  loginPlayer.textContent = '';
  emailPlayer.textContent = '';
  passwordPlayer.textContent = '';

  lobbyMenu.style.display = 'block'
  lobbyPlayerAkk.style.display = 'none'

  moveThemeCard(false);
});


});