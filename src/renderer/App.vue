<template>
  <div id="app">
    <!-- 登録したコンポーネントをカスタム要素として利用する -->
    <main-screen></main-screen>
  </div>
</template>

<script>
  // メイン画面のコンポーネントをimportする
  import MainScreen from '@/components/MainScreen'

  export default {
    name: 'electron-vue_adb_client',
    components: {
      MainScreen // importしたメイン画面のコンポーネントを登録する
    }
  }
</script>

<style>
  /* CSS */
</style>
