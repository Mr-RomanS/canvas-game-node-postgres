import { translations } from './languages.js';


document.addEventListener('DOMContentLoaded', () => {

const menuBtn = document.getElementById('btn_Menu');
const sideMenu = document.getElementById('sideMenu');
const lobbyMenu = document.getElementById('lobbyMenu');
const lobbyPlayerAkk = document.getElementById('lobbyPlayerAkk');
const btnX_Menu = document.getElementById('btnX_Menu');

const langBtn = document.getElementById('langBtn');
const langBtnText = document.getElementById('langBtnText');
const langPopup = document.getElementById('langPopup');
const langRoot = document.getElementById('language_list');

const signUp = document.getElementById('sign_up');
const signIn = document.getElementById('sign_in');
const signUpSuccessfullText = document.getElementById('SignUpSuccessfullText')
const warningTextBlockSignUp = document.getElementById('warningTextBlockSignUp');

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

//-----Account registration form.
const signUpForm = document.getElementById('signUpForm');
const loginInputSignUpForm = document.getElementById('loginInputSignUpForm');
const emailInputSignUpForm = document.getElementById('emailInputSignUpForm');
const passwordInputSignUpForm = document.getElementById('passwordInputSignUpForm');

const verificationBlock = document.getElementById('verificationBlock');
const verificationForm = document.getElementById('verificationForm');
const verificationCode = document.getElementById('verificationCode');
const verificationTextSpan = document.getElementById('verificationTextSpan');
const display = document.getElementById('countdown');
const resendCode = document.getElementById('resendCode');
const backToSignUp = document.getElementById('backToSignUp');

const loginPlayer = document.getElementById('loginPlayer');
const emailPlayer = document.getElementById('emailPlayer');
const warningInCorrectPass = document.getElementById('warningInCorrectPass');

const logoutButton = document.getElementById('logoutButton');
const bthDelete = document.getElementById('bthDelete');
//-----Login form.
const signInForm = document.getElementById('signInForm');
const logInEmailInput = document.getElementById('logInEmailInput');
const logInPasswordInput = document.getElementById('logInPasswordInput');
//-----Form for changing the login in the account.
const avatarUploadMessage = document.getElementById('avatarUploadMessage');
const changeNameForm = document.getElementById('changeNameForm');
const newLoginMessage = document.getElementById('newLoginMessage');
const loginPlayers = document.getElementById('loginPlayers');

//-----Form for changing the password in the account.
const changePasswordForm = document.getElementById('changePasswordForm');
const oldPassPlayer = document.getElementById('oldPassPlayer');
const newPassPlayer = document.getElementById('newPassPlayer');
const passwordMessage = document.getElementById('passwordMessage');

const modalBody = document.getElementById('modalBody');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');
const modalTitle = document.getElementById('modalTitle');



let isAuthenticated = false;
// Call the verification function IMMEDIATELY when the page loads
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
            }
        }
    } catch (err) {
        console.log("Session not found. User is not authorized.");
    }
};

checkAuth();

// Global language translation function.
const getTranslation = (key) => {
    const currentLang = localStorage.getItem('lang') || 'en';
    return translations[currentLang][key] || key;
};

const clearUIStatusMessages = () => {
    // Clear success/error messages for login and password changes
    if (newLoginMessage) newLoginMessage.textContent = '';
    if (passwordMessage) passwordMessage.textContent = '';
    
    // Clear login and registration errors
    if (warningInCorrectPass) {
        warningInCorrectPass.textContent = '';
        warningInCorrectPass.style.display = 'none';
    }
    if (warningTextBlockSignUp) warningTextBlockSignUp.textContent = '';
    if (signUpSuccessfullText) signUpSuccessfullText.textContent = '';
};
/* =========================
  MENU: open / close
   ========================= */
function openMenu() {
  if (!sideMenu || !menuBtn) return;

  sideMenu.classList.add('active');

  btnX_Menu.focus();
}
function closeMenu() {
  if (!sideMenu || !menuBtn) return;
  sideMenu.classList.remove('active');
  clearUIStatusMessages();
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
    FORMS: Sign Up / Sign In
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
      LANGUAGE: open / close
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
    LANGUAGE RECOVERY
   ========================= */

// Language button (open/close popup)
if (langBtn) {
  langBtn.addEventListener('click', (e) => {
    // Prevent the click from reaching document.click (which closes the popup)
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

//  Language selection inside the popUp
if (langPopup) {
  langPopup.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;

    const lang = btn.dataset.lang;

    // Save the selection
    localStorage.setItem('lang', lang);

    if (langBtnText) {
  langBtnText.textContent = lang.toUpperCase();
}


    // Close the popup
    closeLang();

    setLanguage(lang);
  });
}

/* =========================
  EVENT HANDLERS
   ========================= */

// Menu open button (burger)
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    toggleMenu();
  });
}

//  X button to close the menu
if (btnX_Menu) {
  btnX_Menu.addEventListener('click', () => {
    closeMenu();
  });
}
document.addEventListener('click', (e) => {
  if (!sideMenu) return;

  const isMenuOpen = sideMenu.classList.contains('active');
  if (!isMenuOpen) return;

// if the click is NOT inside the menu AND NOT on the burger button
  if (!sideMenu.contains(e.target) && e.target !== menuBtn) {
    closeMenu();
  }
});

// Open the Sign Up form
if (openSignUp) {
  openSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    showSignUp();
  });
}
//  Open the Sign In form
if (openSignIn) {
  openSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    showSignIn();
  });
}
//  Click outside the language block — close the popUp
document.addEventListener('click', (e) => {
  if (!langRoot) return;

  if (!langRoot.contains(e.target)) {
    closeLang();
  }
});
// Escape — close everything that is “popup”
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Close the login/registration forms
  hideAuthForms();

  closeLang();
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
//  On load: style the buttons and restore the selection
document.querySelectorAll('.themeColor').forEach(btn => {
  // Set the square color from data-bg
  btn.style.setProperty('--c', btn.dataset.bg);
});
if (savedBg) {
  setBodyBackground(savedBg);
  markSelected(savedBg);
}
// Click on a color
if (themeGrid) {
  themeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.themeColor');
    if (!btn) return;

    const color = btn.dataset.bg;
    setBodyBackground(color);
    markSelected(color);
  });
}

// -------display password as text, change the image.
function setupPasswordToggle(buttonId, wrapperId) {
  const btn = document.getElementById(buttonId);
  const wrap = document.getElementById(wrapperId);
  if (!btn || !wrap) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const input = wrap.querySelector('input');
    if (!input) return;

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';

// If the button itself is an IMG — use it. If not — find the IMG inside.
    const icon = btn.tagName === 'IMG' ? btn : btn.querySelector('img');

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
setupPasswordToggle('btnPassIconOld', 'wrapperOldPass');
setupPasswordToggle('btnPassIconNew', 'wrapperNewPass');

// ------Opening and closing the modal window.
function openModalWindow() {
    closeMenu(); 
    modalOverlay.style.display = 'flex';
}
function showModalMessage(text) {
    modalBody.textContent = text;
    modalTitle.textContent = '';
    openModalWindow();
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
});

//-------Change the avatar inside the account.----
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
      avatarUploadMessage.style.display = 'none';
    }else{
      const error = await response.text();
      console.log('Upload error: ' + error);
      avatarUploadMessage.textContent = getTranslation('avatar_upload_error');
      avatarUploadMessage.style.color = 'red';
    }
  }catch (err) {
        console.error('Network error:', err);
    }
});
//-------Save the input value to PostgreSQL.-----

let tempEmail = ""; 
// Store the email here so it isn’t lost after clearing the form

signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = loginInputSignUpForm.value;
    const email = emailInputSignUpForm.value;
    const password = passwordInputSignUpForm.value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json(); // Added to read errors from the server

        if (response.ok) {
            tempEmail = email; // Remember the email before clearing the form
            
            startRegistrationTimer(300);

            verificationBlock.style.display = 'block';
            lobbyMenu.style.display = 'none';

        } else {
          warningTextBlockSignUp.style.display = 'block';
          // Check the type of error sent by the server
          if (data.error === 'USER_EXISTS') {
              warningTextBlockSignUp.textContent = getTranslation('UserAlreadyExists');
          } else {
                warningTextBlockSignUp.textContent = getTranslation('GeneralError');
            }
          }
    } catch (err) {
        console.error("Network error:", err);
        warningTextBlockSignUp.textContent = getTranslation('NetworkError');
    }
});

let countdownInterval; // Global variable for managing the timer
function startRegistrationTimer(durationInSeconds) {
    const timerContainer = document.getElementById('timerDisplay');

    // Reset the previous timer, if any
    clearInterval(countdownInterval);
    timerContainer.style.display = 'block';
    resendCode.style.pointerEvents = 'none';// Disable the resend button while the timer is running
    resendCode.style.opacity = '0.5';

    let timer = durationInSeconds;
    
    countdownInterval = setInterval(() => {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdownInterval);
            display.textContent = "00:00";
            // When time is up, allow resending
            resendCode.style.pointerEvents = 'auto';
            resendCode.style.opacity = '1';
            resendCode.style.cursor = 'pointer';
        }
    }, 1000);
}

verificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    verificationTextSpan.style.display = 'none';
    const code = verificationCode.value;

    try {
        const response = await fetch('/verify-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tempEmail, code }) // Use the saved tempEmail
        });

        const data = await response.json();

        if (response.ok) {
            location.reload();
        } else {
            verificationTextSpan.style.display = 'block';
        }
    } catch (err) {
        console.error('Verification error:', err);
    }
});

backToSignUp.addEventListener('click', () => {
    clearInterval(countdownInterval); 

    verificationBlock.style.display = 'none';
    lobbyMenu.style.display = 'block';
    showSignUp();

    verificationCode.value = '';
    verificationTextSpan.style.display = 'none';
    
    display.textContent = "5:00";
});

resendCode.addEventListener('click', async () => {
    if (resendCode.style.pointerEvents === 'none') return;

    try {
        const response = await fetch('/resend-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tempEmail })
        });

        if (response.ok) {
            // Если код успешно отправлен, снова запускаем таймер на 5 минут
            startRegistrationTimer(300);
            // Скрываем старые ошибки, если они были
            verificationTextSpan.style.display = 'none';
        } else {
            console.error('Network error during resend:', err);
            verificationTextSpan.style.display = 'block';
            verificationTextSpan.textContent = getTranslation('NetworkError');
        }
    } catch (err) {
        console.error('Resend fetch error:', err);
    }
});

//-------Account login form.----
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = logInEmailInput.value;
    const password = logInPasswordInput.value;

   // Hide the old error before making a new request
    warningInCorrectPass.style.display = 'none'; 
    warningInCorrectPass.textContent = '';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

            logInEmailInput.value = '';
            logInPasswordInput.value = '';

        if (response.ok) {
            const userData = await response.json();

            // Success: populate the profile
            loginPlayer.textContent = userData.username;
            emailPlayer.textContent = userData.email;

            isAuthenticated = true;
            lobbyMenu.style.display = 'none';
            lobbyPlayerAkk.style.display = 'block';
            moveThemeCard(true);

            hideAuthForms();// Close the login window

        } else {
            // SERVER RESPONDED WITH AN ERROR (401, 404, etc.)
            warningInCorrectPass.textContent = getTranslation('IncorrectEMailorPass');
            warningInCorrectPass.style.display = 'block';
        }
    } catch (err) {
        console.error("Network error:", err);
        warningInCorrectPass.textContent = getTranslation('ServerNotResponding');
        warningInCorrectPass.style.display = 'block';
    }
});
//-----Change the login in the account.
changeNameForm.addEventListener('submit', async (event) => {
  event.preventDefault();

    const newLogin = loginPlayers.value.trim();

    newLoginMessage.textContent = '';

    if(newLogin === ''){
      newLoginMessage.textContent = getTranslation('LoginCannotBeEmpty');
      newLoginMessage.style.color = 'red';
      return;
    }

    try{
      const response = await fetch('/update-username',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: newLogin,
        })
      });
      const data = await response.json();

      if(response.ok){
        newLoginMessage.textContent = getTranslation('SuccessfullyUpdateInDb');
        newLoginMessage.style.color = 'green';

        loginPlayer.textContent = newLogin;

        loginPlayers.value = '';
      }else{
        console.log('Server error:', data.error, data.message);
        newLoginMessage.textContent = 'Error!';
        newLoginMessage.style.color = 'red';
      }
    }catch(err){
      console.error('Error while changing name:', err);
      newLoginMessage.textContent = getTranslation('ServerConnectionError');
      newLoginMessage.style.color = 'red';
    }
});
//-----Change the password in the account.
changePasswordForm.addEventListener('submit', async(event) =>{
  event.preventDefault();

  const oldPass = oldPassPlayer.value;
  const newPass = newPassPlayer.value;

  const currentLang = localStorage.getItem('lang') || 'en';

  passwordMessage.textContent = '';

  try{
    const response = await fetch('/update-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        oldPassword: oldPass,
        newPassword: newPass,
      })
    });

    if(response.ok){
      passwordMessage.textContent = getTranslation('pass_success');
      passwordMessage.style.color = 'green';
      oldPassPlayer.value = '';
      newPassPlayer.value = '';
    }else if (response.status === 401) {
      // Directly specify the text for an incorrect password
      passwordMessage.textContent = getTranslation('pass_err_old');
      passwordMessage.style.color = '#8B1E1E';
    } else {
      // For all other errors (500, etc.)
      passwordMessage.textContent = getTranslation('pass_err_fail');
      passwordMessage.style.color = '#8B1E1E';
    }
  }catch(err){
    const currentLang = localStorage.getItem('lang') || 'en';
    passwordMessage.textContent = translations[currentLang]['pass_err_server'];
    passwordMessage.style.color = '#8B1E1E';
  }
})

//-------Log out of the account.--------
logoutButton.addEventListener('click', async () => {
    try {
        // Notify the server that we are logging out
        const response = await fetch('/logout', { method: 'POST' });

        if (response.ok) {
            // If the server confirmed the logout, reset the state
            isAuthenticated = false;


            //  Toggle visibility (your old code)
            showSignIn();
            lobbyMenu.style.display = 'block';
            lobbyPlayerAkk.style.display = 'none';
            moveThemeCard(false);

            loginPlayer.textContent = '';
            emailPlayer.textContent = '';

            clearUIStatusMessages();
            closeMenu();
        } else {
          showModalMessage(getTranslation('ServerErrorToLogOut'));
        }
    } catch (err) {
        console.error('Network error during logout:', err);
    }
});
// -----Warning about deleting saved login and password.-----
bthDelete.addEventListener('click', (e) =>{
  if(e){
    modalBody.textContent = getTranslation('confirm_delete');
    modalDeleteBtn.style.display = 'block';
    modalTitle.textContent = '';
    openModalWindow();
    closeMenu();
  }
    
})
// -----Deleting saved login and password.-----
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
        modalTitle.textContent = '';
      }else {
        modalBody.textContent = getTranslation('delete_error');
        modalTitle.textContent = '';
        }
    }catch (err) {
        console.error('Network error during deletion:', err);
        modalBody.textContent = getTranslation('pass_err_server');
    }
});


});