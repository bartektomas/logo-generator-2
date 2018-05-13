<template>
  <div id="app">
    <!--
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    -->

    <router-view/>
  </div>
</template>

<style>
/*
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
*/

body{
  background-color: rgb(250, 250, 250);
  margin: 0;
  margin-bottom: 100px;

  font-family: "Roboto", sans-serif;
  font-weight: normal;
  color: rgba(0,0,0,0.87);
}

.el-step__icon.is-icon{
  background-color: rgb(250, 250, 250);
}

.el-step__head.is-finish,
.el-step__title.is-finish{
  /* color: rgba(64, 158, 255, 0.7); */
  color: #c0c4cc;
}

.el-step__head.is-finish:hover,
.el-step__title.is-finish:hover{
  cursor: pointer;
  color: #94989e;
}

a{
  color: #039be5;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.el-card{
  /* max-width: 500px; */
  /* margin: auto; */
  margin-top: 30px;
}
</style>
