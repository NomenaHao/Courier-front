<template>

  <div class="page">
    <div class="wrapper">
      <div class="title-text">
        <div class="title login">Se connecter</div>
        <div class="title signup">S'inscrire</div>
      </div>
      <div class="form-container">
        <div class="slide-controls">
          <input type="radio" name="slide" id="login" checked>
          <input type="radio" name="slide" id="signup">
          <label for="login" class="slide login">Connexion</label>
          <label for="signup" class="slide signup">Inscription</label>
          <div class="slider-tab"></div>
        </div>
        <div class="form-inner">
          <form  class="login" @submit.prevent="handleLogin">
            <div class="field">
              <input type="text" v-model="loginForm.username" placeholder="Nom d'utilisateur" required>
            </div>
            <div class="field"> 
              <input type="password" v-model="loginForm.password" placeholder="Mot de passe" required>
            </div>
            <div class="pass-link"><a href="#">Mot de passe oublié?</a></div>
            <div class="field btn">
              <div class="btn-layer"></div>
              <input type="submit" value="Connexion">
            </div>
          </form>
          <!-- SIGNUP -->  
          <form  class="signup" @submit.prevent="handleSignup">
            <div class="field">
              <input type="text" v-model="signupForm.username" placeholder="Nom d'utilisateur" required>
            </div>
            <div class="field">
              <input type="password" v-model="signupForm.password" placeholder="Mot de passe" required>
            </div>
            <div class="field">
              <input type="password" v-model="signupForm.confirmPassword" placeholder="Confirmer le mot de passe" required>
            </div>
            <div class="field">
              <select v-model="signupForm.role" required>
                <option disabled value="">Choisir un rôle</option>
                <option value="client">Client</option>
                <option value="livreur">Livreur</option>
              </select>
            </div>
            <div class="field btn">
              <div class="btn-layer"></div>
              <input type="submit" value="S'inscrire">
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loginForm = ref({
  username: '',
  password: ''
})

const signupForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  role: ''
})


// LOGIN
const handleLogin = async () => {

  try {

    const response = await api.post('auth/login/', loginForm.value)

    localStorage.setItem('access', response.data.access)
    localStorage.setItem('refresh', response.data.refresh)

    alert("Connexion réussie")

    // redirection
    window.location.href = '/home'

  } catch (error) {

    alert("Erreur login")

  }

}


// REGISTER
const handleSignup = async () => {

  if (signupForm.value.password !== signupForm.value.confirmPassword) {

    alert("Les mots de passe ne correspondent pas")
    return

  }

  try {

    await api.post('auth/register/', {
      username: signupForm.value.username,
      password: signupForm.value.password,
      role: signupForm.value.role
    })

    alert("Compte créé")

  } catch (error) {

    alert("Erreur inscription")

  }

}


// animation slide
onMounted(() => {

  const loginText = document.querySelector('.title-text .login')
  const loginFormDom = document.querySelector('form.login')
  const loginBtn = document.querySelector('label.login')
  const signupBtn = document.querySelector('label.signup')

  signupBtn.addEventListener('click', () => {
    loginFormDom.style.marginLeft = '-50%'
    loginText.style.marginLeft = '-50%'
  })

  loginBtn.addEventListener('click', () => {
    loginFormDom.style.marginLeft = '0%'
    loginText.style.marginLeft = '0%'
  })

})
</script>

<style>
.form-inner form .field select{
  height: 100%;
  width: 100%;
  outline: none;
  padding-left: 15px;
  border-radius: 15px;
  border: 1px solid lightgrey;
  border-bottom-width: 2px;
  font-size: 17px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.form-inner form .field select:focus{
  border-color: #1a75ff;
}
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

html,
body {
  display: grid;
  height: 100%;
  width: 100%;
  place-items: center;
  background: -webkit-linear-gradient(left, #003366, #004080, #0059b3, #0073e6);
}

::selection {
  background: #1a75ff;
  color: #fff;
}

.wrapper {
  overflow: hidden;
  max-width: 390px;
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 15px 20px rgba(0, 0, 0, 0.1);
}

.wrapper .title-text {
  display: flex;
  width: 200%;
}

.wrapper .title {
  width: 50%;
  font-size: 35px;
  font-weight: 600;
  text-align: center;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wrapper .slide-controls {
  position: relative;
  display: flex;
  height: 50px;
  width: 100%;
  overflow: hidden;
  margin: 30px 0 10px 0;
  justify-content: space-between;
  border: 1px solid lightgrey;
  border-radius: 15px;
}

.slide-controls .slide {
  height: 100%;
  width: 100%;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  line-height: 48px;
  cursor: pointer;
  z-index: 1;
  transition: all 0.6s ease;
}

.slide-controls label.signup {
  color: #000;
}

.slide-controls .slider-tab {
  position: absolute;
  height: 100%;
  width: 50%;
  left: 0;
  z-index: 0;
  border-radius: 15px;
  background: -webkit-linear-gradient(left, #003366, #004080, #0059b3, #0073e6);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

input[type="radio"] {
  display: none;
}

#signup:checked~.slider-tab {
  left: 50%;
}

#signup:checked~label.signup {
  color: #fff;
  cursor: default;
  user-select: none;
}

#signup:checked~label.login {
  color: #000;
}

#login:checked~label.signup {
  color: #000;
}

#login:checked~label.login {
  cursor: default;
  user-select: none;
}

.wrapper .form-container {
  width: 100%;
  overflow: hidden;
}

.form-container .form-inner {
  display: flex;
  width: 200%;
}

.form-container .form-inner form {
  width: 50%;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.form-inner form .field {
  height: 50px;
  width: 100%;
  margin-top: 20px;
}

.form-inner form .field input {
  height: 100%;
  width: 100%;
  outline: none;
  padding-left: 15px;
  border-radius: 15px;
  border: 1px solid lightgrey;
  border-bottom-width: 2px;
  font-size: 17px;
  transition: all 0.3s ease;
}

.form-inner form .field input:focus {
  border-color: #1a75ff;
  /* box-shadow: inset 0 0 3px #fb6aae; */
}

.form-inner form .field input::placeholder {
  color: #999;
  transition: all 0.3s ease;
}

form .field input:focus::placeholder {
  color: #1a75ff;
}

.form-inner form .pass-link {
  margin-top: 5px;
}

.form-inner form .signup-link {
  text-align: center;
  margin-top: 30px;
}

.form-inner form .pass-link a,
.form-inner form .signup-link a {
  color: #1a75ff;
  text-decoration: none;
}

.form-inner form .pass-link a:hover,
.form-inner form .signup-link a:hover {
  text-decoration: underline;
}

form .btn {
  height: 50px;
  width: 100%;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
}

form .btn .btn-layer {
  height: 100%;
  width: 300%;
  position: absolute;
  left: -100%;
  background: -webkit-linear-gradient(right, #003366, #004080, #0059b3, #0073e6);
  border-radius: 15px;
  transition: all 0.4s ease;
  ;
}

form .btn:hover .btn-layer {
  left: 0;
}

form .btn input[type="submit"] {
  height: 100%;
  width: 100%;
  z-index: 1;
  position: relative;
  background: none;
  border: none;
  color: #fff;
  padding-left: 0;
  border-radius: 15px;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
}
</style>
/* Responsive adjustments */
<style scoped>
@media (max-width: 880px) {
  .page {
    padding: 20px;
  }

  .wrapper {
    max-width: 360px;
    width: 100%;
    padding: 20px;
  }

  .wrapper .title {
    font-size: 28px;
  }

  .slide-controls {
    height: 44px;
    margin: 20px 0 10px;
  }

  .slide-controls .slide {
    font-size: 16px;
    line-height: 42px;
  }

  .form-inner form .field {
    height: 44px;
  }

  .form-inner form .field input {
    font-size: 15px;
    padding-left: 12px;
  }

  form .btn {
    height: 44px;
  }

  form .btn input[type="submit"] {
    font-size: 16px;
  }
}

@media (max-width: 420px) {
  .wrapper {
    padding: 16px;
    border-radius: 12px;
  }

  .wrapper .title {
    font-size: 22px;
  }

  .slide-controls {
    margin: 14px 0 8px;
  }

  .form-inner form .field {
    height: 42px;
  }

  .form-inner form .signup-link {
    font-size: 14px;
  }
}
</style>
