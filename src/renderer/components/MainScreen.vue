<template>
  <div>
    <div class="container">
      <div class="row">
        <b-card class="col-12">
          <h4>端末選択</h4>
          <b-form-group label="操作対象" horizontal :label-cols="2">
            <div class="form-inline">
              <b-form-select v-model="selectedDevice" :options="devices" class="col-10"/>
              <!-- v-on:clickでクリックイベントをmethodsのメソッドと紐付ける -->
              <!-- v-bind:で対象をdata要素と紐付ける。この場合はdisabledの状態をisUpdatingDeviceListと紐付ける -->
              <b-button v-on:click="onClickUpdateListBtn" v-bind:disabled="isUpdatingDeviceList">リスト更新</b-button>
            </div>
          </b-form-group>
        </b-card>
      </div>
      <div class="row">
        <b-card class="col-12">
          <h4>apkインストール</h4>
          <b-form-group label="apkファイル" horizontal :label-cols="2">
            <!-- @clickはv-on:clickの省略形 -->
            <b-button @click="onClickSelectApkBtn">apkファイル選択</b-button>　{{installApkPath}}
            <p></p>
            <b-button @click="onClickInstallApkBtn" v-bind:disabled="isInstalling">インストール</b-button>
          </b-form-group>
          <b-form-group label="" horizontal :label-cols="2">
            <!-- v-modelでチェックの状態をdata要素と紐付ける -->
            <b-form-checkbox v-model="isReplace">既にインストールされている場合は置き換える(-r)</b-form-checkbox>
            <b-form-checkbox v-model="isDowngrade">古いバージョンでの上書きを許可する(-d)</b-form-checkbox>
          </b-form-group>
        </b-card>
      </div>
      <div class="row">
        <b-card class="col-12">
          <h4>アプリアンインストール</h4>
          <b-form-group label="パッケージ名" horizontal :label-cols="2">
            <div class="form-inline">
              <b-form-input v-model="uninstallPackage" type="text"
                placeholder="アンインストール対象のパッケージ名を入力してください" class="col-9"></b-form-input>
              <b-button @click="onClickUninstallBtn" v-bind:disabled="isUninstalling">アンインストール</b-button>
            </div>
          </b-form-group>
        </b-card>
      </div>
      <div class="row">
        <b-card class="col-12">
          <h4>アプリデータ削除</h4>
          <b-form-group label="パッケージ名" horizontal :label-cols="2">
            <div class="form-inline">
              <b-form-input v-model="clearAppDataPackage" type="text"
                placeholder="データ削除対象のパッケージ名を入力してください" class="col-10"></b-form-input>
              <b-button @click="onClickClearAppDataBtn" v-bind:disabled="isClearingAppData">データ削除</b-button>
            </div>
          </b-form-group>
        </b-card>
      </div>
    </div>
    <div class="container">
      <!-- モーダルダイアログ。refはコード上からこのモーダルを参照するための識別子を定義するもの -->
      <b-modal ref="messageDialog" hide-header ok-only>{{dialogMessage}}</b-modal>
    </div>
  </div>
</template>

<script>
  // 別のjsファイルをimportする
  import AdbClient from '../logic/AdbClient'

  export default {
    name: 'main-screen',
    data () {
      return {
        devices: [
          {value: null, text: 'adbで操作する対象の端末を選択してください'}
        ],
        selectedDevice: null,
        isUpdatingDeviceList: false,
        installApkPath: 'apkファイルを選択してください',
        isReplace: false,
        isDowngrade: false,
        isInstalling: false,
        uninstallPackage: '',
        isUninstalling: false,
        clearAppDataPackage: '',
        isClearingAppData: false,
        dialogMessage: ''
      }
    },
    methods: {
      onClickUpdateListBtn () {
        this.isUpdatingDeviceList = true
        AdbClient.devices().then((res) => {
          // 端末ドロップダウンリストを一旦リセット
          this.devices = []
          this.selectedDevice = null
          for (let device of res) {
            this.devices.push({value: device.id, text: device.name})
          }
          this.selectedDevice = this.devices[0].value
          this.isUpdatingDeviceList = false
          this.showMessageDialog('機器リストを更新しました')
        }).catch((err) => {
          this.devices = [
            {value: null, text: err.message}
          ]
          this.selectedDevice = null
          this.isUpdatingDeviceList = false
        })
      },
      onClickSelectApkBtn () {
        const dialogOption = {
          // オープン対象をapkファイルのみに限定
          filters: [{name: 'apkファイル', extensions: ['apk']}]
        }
        // vue-electronモジュールを入れていれば、this.$electronで参照できる
        this.$electron.remote.dialog.showOpenDialog(this.$electron.BrowserWindow, dialogOption, (filePaths) => {
          // 未選択（キャンセル）の場合はfilePaths自身がundefinedで返ってくる
          this.installApkPath = (filePaths && filePaths[0] != null) ? filePaths[0] : ''
        })
      },
      onClickInstallApkBtn () {
        this.isInstalling = true
        AdbClient.install(this.selectedDevice, this.installApkPath, this.isReplace, this.isDowngrade).then(() => {
          this.isInstalling = false
          this.showMessageDialog('インストールに成功しました')
        }).catch((err) => {
          this.isInstalling = false
          this.showMessageDialog(err.message)
        })
      },
      onClickUninstallBtn () {
        this.isUninstalling = true
        AdbClient.uninstall(this.selectedDevice, this.uninstallPackage).then(() => {
          this.isUninstalling = false
          this.showMessageDialog('アンインストールに成功しました')
        }).catch((err) => {
          this.isUninstalling = false
          this.showMessageDialog(err.message)
        })
      },
      onClickClearAppDataBtn () {
        this.isClearingAppData = true
        AdbClient.clearAppData(this.selectedDevice, this.clearAppDataPackage).then(() => {
          this.isClearingAppData = false
          this.showMessageDialog('アプリデータの削除に成功しました')
        }).catch((err) => {
          this.isClearingAppData = false
          this.showMessageDialog(err.message)
        })
      },
      showMessageDialog (message) {
        this.dialogMessage = message
        this.$refs.messageDialog.show()
      }
    }
  }
</script>

<style>
  .row {
    margin-top: 20px
  }
</style>
