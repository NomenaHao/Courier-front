<template>
    <nav class="navbar navbar-expand-lg navbar-light fixed-top py-3 d-block bg-white shadow-sm"
      data-navbar-on-scroll="data-navbar-on-scroll">
    <div class="container"><a class="navbar-brand" href="/home">
      <img src="@/assets/img/gallery/logo.png" height="45" alt="logo" />
    </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span
          class="navbar-toggler-icon"> </span></button>
      <div class="collapse navbar-collapse border-top border-lg-0 mt-4 mt-lg-0" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto pt-2 pt-lg-0 font-base">
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home' }">Acceuil</router-link>
          </li>
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home', hash: '#services' }">Nos Services</router-link>
          </li>
          <li class="nav-item px-2">
            <router-link class="nav-link" :to="{ path: '/home', hash: '#findUs' }">Nous contacter</router-link>
          </li>
        </ul>
        
        <a class="btn btn-primary order-1 order-lg-0 ms-lg-3" href="/profile">Mon profil</a>
        <a href="" class="btn btn-primary order-1 order-lg-0 ms-lg-3"><i class="fa fa-sign-out" aria-hidden="true"></i></a>
        
      </div>
    </div>
  </nav>
</template>
