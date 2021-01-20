---
path: "/blog/qtrmulbdqnxllyzxvdss"
date: "2021/01/20"
title: "NestJS+Angular+Scullyを試してみる"
tag: ["Angular", "NestJS", "Scully"]
thumbnailImage: "/images/article/qtrmulbdqnxllyzxvdss/ssqtrmulbdqnxllyzxvdss.png"
---

# 概要
Next.jsが流行っている今日この頃。  
AngularでもScullyやnxを使えば簡単にSSG+APIの構成が作れるのでは？と思ったので試してみる。

# セットアップ
## NestJS+Angularの準備
nxを使ってNestJS+Angularまでやる。 

```bash
$ npx create-nx-workspace
npx: installed 190 in 24.11s
? Workspace name (e.g., org name)     nx-scully-sample
? What to create in the new workspace angular-nest      [a workspace with a full stack application (Angular + Nest)]
? Application name                    nx-scully-sample
? Default stylesheet format           SASS(.scss)  [ http://sass-lang.com   ]
? Default linter                      ESLint [ Modern linting tool ]
? Use Nx Cloud? (It's free and doesn't require registration.) No
```

## Scully追加
[公式サイト](https://scully.io/docs/learn/getting-started/installation/)を参考にしながら追加する。

```bash
$ npm run ng add @scullyio/init -- --nx-scully-sample
```

## RouterModule追加
ScullyがAngular Routerを必要としている。  
nxで作成したやつはそのままだと入っていないので追加する。  

これがないとビルドしたものにアクセスするときにNullInjectorで落ちる。  
※気づかないで数時間溶かした。

RouterModuleを追加するために雑にコンポーネントを作って対応する。

### top.component作成
nxが生成したapp.componentに記載されてる内容を切り出す。  
htmlとtsについては下記の通り。  
※cssについては割愛

```html
<div style="text-align: center">
  <h1>Welcome to nx-scully-sample!</h1>
  <img
    width="450"
    src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png"
  />
</div>
<div>Message: {{ hello$ | async | json }}</div>
```

```tsx
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@nx-scully-sample/api-interfaces';

@Component({
  selector: 'nx-scully-sample-root',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss'],
})
export class TopComponent {
  hello$ = this.http.get<Message>('/api/hello');
  constructor(private http: HttpClient) {}
}
```

### app-router.module.tsを追加
```tsx
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopComponent } from './components/top/top.component';

const routes: Routes = [
  { path: '', component: TopComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### app.module.ts修正
作った`component`と`app-router.module.ts`を読み込む。

```tsx
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { AppRoutingModule } from './app-router.module';
import { TopComponent } from './components/top/top.component';

@NgModule({
  declarations: [AppComponent, TopComponent],
  imports: [BrowserModule, HttpClientModule, ScullyLibModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### app.component.html修正
routingに対応するように修正する。  
ここまで修正したら準備は完了。

```html
<router-outlet></router-outlet>
```

# 動かしてみる
まずはビルド。  
AngularのビルドをしたあとにScullyのビルドをする。  

```bash
# Angularのビルド
$ npm run build --  --prod
# scullyのビルド
$ npm run scully -- --scanRoutes
```

[公式の通り](https://scully.io/docs/learn/getting-started/serving/)にscullyのserveを実行すればOK。

```bash
$ npm run scully:serve
```

# Firebaseにデプロイしてみる
ここまででビルドして動作確認できるようになった。  
せっかくなのでFirebaseにあげて動くところまでやってみる。

## 準備
### Firebase周りの設定
Firebase周りの設定をやる。  
CLIで選択していけばOK。

```bash
$ npx firebase init
> functionsとhostingを選択
> 適当にproject選択(今回はあるもの選んだ)
> 言語選択はお好みで(今回はビルドしたもの上げるのでjs)
> eslintの質問はNo
> npm installもNo
> spaじゃなくなっているので全URLを/index.htmlに飛ばすのはNo
> 404の上書きもNo
> index.htmlの上書きもNo
```

生成されたFirebase.jsonを↓の様に修正しておく。

```json
{
  "hosting": {
    "public": "dist/static",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/v1/**/*",
        "function": "api"
      },
      {
        "source": "/*[!v1]*/**",
        "destination": "/"
      }
    ]
  },
  "functions": {
    "source": "dist/apps/api"
  }
}
```

### app/api/main.ts修正
次にファイルを修正していく。  
まずはNestJS側のコードである`app/api/main.ts`を修正。  
デフォのままではFirebaseで起動できないので対応する。

```tsx
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from './app/app.module';
import * as express from 'express';
import * as functions from 'firebase-functions';

const server = express();

async function bootstrap(instance) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(instance));
  app.setGlobalPrefix('v1');
  return app.init();
}

bootstrap(server)
  .then(v => Logger.log(`Ready`))
  .catch(e => Logger.warn(e));
export const api = functions.https.onRequest(server);
```

### top.component.ts修正
APIのパスを変えたので呼び出している箇所の修正。  

```tsx
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@nx-scully-sample/api-interfaces';

@Component({
  selector: 'nx-scully-sample-root',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss'],
})
export class TopComponent {
  hello$ = this.http.get<Message>('/v1/hello');
  constructor(private http: HttpClient) {}
}
```

### ビルド結果のフォルダにpackage.jsonを追加
Firebase Functionsを使うのにJSのファイルと一緒に依存関係が示されている`package.json`を用意する必要がある。  
手動でコピーしても良いが、不要な記載がある+面倒なので簡単なscriptを用意する。  
`/tools/generator`配下に`package-json-generator.js`を作成。

```jsx
const path = require('path');
const fs = require('fs');

const original = require('../../package.json');
const ROOT_PATH = path.resolve(__dirname, '../../');
const OUTPUT_PATH = path.resolve(ROOT_PATH, 'dist/apps/api');

const functionsJson = {
  main: "main.js",
  engines: {
    node: "12"
  }
};
(function writeJson() {
  const dependencies = original.dependencies;
  const writeJson = {
    ...functionsJson,
    dependencies
  }
  fs.writeFileSync(`${OUTPUT_PATH}/package.json`, JSON.stringify(writeJson));
})();
```

### package.json修正
ビルド & デプロイしやすいように`npm scripts`を追加。  
上2つがscullyのビルド用で残りがFirebase周りのため。

```json
{
  "scriptis": {
    "scully": "scully",
    "scully:prod": "scully --scanRoutes --prod --RSD",
    "firebase": "firebase",
    "firebase:deploy": "firebase deploy",
    "generate:package": "node tools/generators/package-json-generator.js"
  },
}
```

## デプロイする
実際にFirebaseにデプロイしてみる。  
この辺うまく設定すればnx周りで吸収できそうだけどそれはまた今度。

```bash
# APIのビルド
$ npm run affected:build

# Scully用にAngularのビルド
$ npm run build -- --prod

# Scullyのビルド
$ npm run scully:prod

# デプロイ
$ npm run firebase:deploy
```

画像の様に表示されればOK。
![ssqtrmulbdqnxllyzxvdss.png](/images/article/qtrmulbdqnxllyzxvdss/ssqtrmulbdqnxllyzxvdss.png)

# まとめ
今回はNestJS+Angular+Scullyを試してみた。  
API+SSGの組み合わせは思ってた通り簡単にできたので良かった。  

ホントはSSRまで試したかったけど、AngularUniversalとScullyが両立できないっぽかったので一旦諦めている。  
※Scullyの何かがwindow関数使っていてSSR時に落ちる。  
頑張ればどうにかできるのかもだけど一筋縄では行かなそうだった。。。

試して思ったがNext.jsの使い勝手がだいぶ良いと思う。  
今回でSSGのみには対応したがSSRには対応できておらず、SSRをやりたいなら(多分)SSGができなくなる。  
＋FWを2つ使うことになるのでNext.jsよりは知らなきゃ行けないことが多いのかなという思い。  

SSGは今のフロントエンドの流行りだと思うし、この構成は面白かったので機会があれば試したい。

# 参考リンク
- [Getting started - Scully](https://scully.io/docs/learn/getting-started/overview/)