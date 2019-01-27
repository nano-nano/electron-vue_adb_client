'use strict'

// chld_processモジュールのexecを参照するimportの記法
import { exec } from 'child_process'

// import文で外部読み込みするために、export defaultでエクスポートする
export default class AdbClient {
  static devices () {
    return new Promise((resolve, reject) => {
      exec('adb devices -l', (error, stdout, stderr) => {
        if (error) {
          reject(new Error('実行中にエラーが発生しました'))
        }
        const outputLines = stdout.match(/([a-zA-Z0-9]+)\s.+model:([a-zA-Z0-9]+)\s.+/g)
        if (outputLines === null || outputLines.length === 0) {
          // 抽出できた行がない = 接続中の端末がない
          reject(new Error('接続しているデバイスがありません'))
        } else {
          let devices = []
          for (let line of outputLines) {
            let trimmed = line.match(/([a-zA-Z0-9]+)\s.+model:([a-zA-Z0-9]+)\s.+/)
            devices.push({id: trimmed[1], name: trimmed[2]})
          }
          resolve(devices)
        }
      })
    })
  }

  static install (apkPath, isReplace, isDowngrade) {
    // コマンドの準備
    let command = 'adb install'
    if (isReplace) command = command + ' -r'
    if (isDowngrade) command = command + ' -d'
    command = command + ` ${apkPath}`

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error('実行中にエラーが発生しました'))
        }
        if (/^Success/.test(stdout)) {
          resolve()
        } else {
          reject(new Error('インストールに失敗しました'))
        }
      })
    })
  }

  static uninstall (packageName) {
    return new Promise((resolve, reject) => {
      exec(`adb uninstall ${packageName}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error('実行中にエラーが発生しました'))
        }
        if (/^Success/.test(stdout)) {
          resolve()
        } else {
          reject(new Error('アンインストールに失敗しました'))
        }
      })
    })
  }

  static clearAppData (packageName) {
    return new Promise((resolve, reject) => {
      exec(`adb shell pm clear ${packageName}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error('実行中にエラーが発生しました'))
        }
        if (/^Success/.test(stdout)) {
          resolve()
        } else {
          reject(new Error('アプリデータの削除に失敗しました'))
        }
      })
    })
  }
}
