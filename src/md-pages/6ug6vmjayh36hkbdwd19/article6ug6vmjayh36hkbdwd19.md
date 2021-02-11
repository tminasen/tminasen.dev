---
path: "/blog/6ug6vmjayh36hkbdwd19"
date: "2021/02/11"
title: "Jest再入門"
tag: ["TypeScript"]
thumbnailImage: "/images/ogp.png"
---

# 概要
tsで書いたコードのテストにはjestを使っている今日この頃。  
毎回雰囲気で使っていて事ある毎に調べているので改めてまとめておく。

# TL;DR.
[コード](https://github.com/Tetsuya-Minase/program-samples/tree/master/re-jest);

# 導入
yarn + typescriptの前提。  
それぞれの導入方法については割愛。

```shell
# jest導入
# ts対応するためにts-jestも入れておく
$ yarn add -D jest ts-jest @types/jest

# 設定ファイル作成
$ yarn ts-jest config:init
```

# シンプルなテスト
## 実装
引数で数値を2つ受け取って足し算する関数を実装する。

```ts
export function sum(a: number, b: number) {
  return a + b;
}
```

## テストコード
```ts
describe('sum', () => {
  it('2 + 3 = 5', () => {
    const result = sum(2, 3);
    // 関数の結果と一致することを確認
    expect(result).toBe(5);
  });
});
```

# エラーになることのテスト
## 実装
```ts
export function division(dividend: number, divisor: number) {
  if (divisor === 0) {
    throw new Error('Do not divide by 0.');
  }
  return dividend / divisor;
}
```

## テストコード
```ts
describe('division', () => {
  it('6 / 0 = error!', () => {
    // エラーになることの確認。
    // そのまま実行するとエラーで落ちるので関数でラップしてあげる
    // ThrowErrorの引数にErrorを渡して上げると内容が同じか比較してくれる
    expect(() => division(6, 0)).toThrowError(new Error('Do not divide by 0.'));
  });
});
```

# オブジェクトの比較
## 実装
```ts
export function getUserById(userId: string) {
  return {id: userId, name: 'Taro', age: 20};
}
```

## テストコード
```ts
describe('getUserById', () => {
  it('取得できる場合', () => {
    const result = getUserById('user1');
    // Objectの値の確認はtoEqualを使う
    expect(result).toEqual({id: 'user1', name: 'Taro', age: 20});
    // toBeで比較するとObjec.isでの比較になるため↓は同値にならずテストがコケる
    // expect(result).toBe({id: 'user1', name: 'Taro', age: 20});
  });
});
```

# その他のmatcher
```ts
describe('matcher sample.', () => {
  it('真偽値', () => {
    // nullであることの確認
    expect(null).toBeNull();
    // null以外だと失敗する
    // expect(undefined).toBeNull();
    
    // undefinedでの確認
    expect(undefined).toBeUndefined();
    // 同じくundefined以外だと失敗する
    // expect(null).toBeUndefined();

    // toBeUndefinedの反対
    expect('hoge').toBeDefined();
    // toBeUndefinedの反対なのでnullは通る
    expect(null).toBeDefined();
    // undefinedは失敗する
    // expect(undefined).toBeDefined();

    // truthyな値であることの確認
    expect('hoge').toBeTruthy();
    expect(1).toBeTruthy();
    // 空文字,0,nullなどfalthyなものは通らない
    // expect('').toBeTruthy();
    // expect(0).toBeTruthy();
    // expect(null).toBeTruthy();

    // falthyな値であることの確認
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
    // truthyな値は通らない
    // expect('hoge').toBeFalsy();
  });
  it('数値', () => {
    // 3より大きい
    expect(4).toBeGreaterThan(3);
    // 3.5以上
    expect(4).toBeGreaterThanOrEqual(3.5);
    // 4以上
    expect(4).toBeGreaterThanOrEqual(4);
    // 5より小さい
    expect(4).toBeLessThan(5);
    // 4.5以下
    expect(4).toBeLessThanOrEqual(4.5);
    // 4以下
    expect(4).toBeLessThanOrEqual(4);
    // 数値においてはtoEqualとtoBeは同じ
    expect(4).toEqual(4);
    expect(4).toBe(4);

    const sum = 0.1 + 0.2;
    // 浮動小数点の場合、丸め誤差があり一致しない
    // expect(sum).toBe(0.3);
    // 浮動小数点の確認はtoBeCloseToを使う
    expect(sum).toBeCloseTo(0.3);
  });
  it('文字列', () => {
    // 文字列は正規表現で確認ができる
    expect('HelloWorld').toMatch(/^Hello.+$/);
    // デフォだと部分一致する
    expect('HelloWorld').toMatch(/orl/);
  });

  it('配列、反復可能オブジェクト', () => {
    const list = ['hoge', 'huga', 'piyo'];
    expect(list).toContain('hoge');
    expect(new Set(list)).toContain('huga');
  });

  it('マッチしない場合', () => {
    // notを挟めばできる
    expect('hoge').not.toBe('huga');
    expect('hoge').not.toBeFalsy();
  });
});
```
他のMatcherは↓参照。
[Expect · Jest](https://jestjs.io/docs/ja/expect)

# 非同期処理のテスト
## 実装
```ts
function asyncResolveClient(): Promise<string> {
  return Promise.resolve('OK');
}

function asyncRejectClient(): Promise<string>{
  return Promise.reject('Error');
}

export async function resolveSample(): Promise<string> {
  return await asyncResolveClient();
}

export async function rejectSample(): Promise<string> {
  return await asyncRejectClient();
}
```

## テストコード
```ts
describe('async function', () => {

  it('非同期の確認', () => {
    // resolvesをつけることでPromiseがresolveされるまで待つ
    expect(resolveSample()).resolves.toBe('OK');
    // 何もつけないとPromiseが返ってきてすぐ比較されるので一致しない
    // expect(resolveSample()).toBe('OK');
  
    // rejectsをつけることでPromiseがrejectされるまで待つ
    expect(rejectSample()).rejects.toBe('Error');
  });
  it('asyncを使った場合', async () => {
    // 結果を待ってから取得した値でチェックする
    const result = await resolveSample();
    expect(result).toBe('OK');
  });
  it('asyncを使った場合(エラー時)', async () => {
    // テストが間違ってエラーにならない場合、テストが通ってしまうため想定した数assertionが呼ばれることのチェック
    expect.assertions(1);
    // rejectされてErrorになるためcatchしてあげる必要がある
    try {
      await rejectSample();
    } catch (e) {
      expect(e).toMatch('Error');
    }
  });
});
```

# SetupとTeardown
テストの最初と最後に何らかの処理をはさみたい場合について。  
モック化、そのリセットなどでやりたいことがあると思う。

```ts
beforeEach(() => {
  console.log('このファイル内のテストケースの前に実行される');
});

describe('setup and teardown sample.', () => {
  // describeの中に書くとこのdescribe内でのスコープになる(このdescribe内のテストが実行される時に実行される)
  beforeAll(() => {
    console.log('全テストケースの前に実行される');
  });
  afterAll(() => {
    console.log('全テストケースの後に実行される');
  });
  beforeEach(() => {
    console.log('各テストケースの前に実行される');
  });
  afterEach(() => {
    console.log('各テストケースの後に実行される');
  });

  it('テスト1', () => {
    console.log('テスト1');  
  });
  it('テスト2', () => {
    console.log('テスト2');  
  });

  it('テスト3', () => {
    console.log('テスト3');  
  });

});
```

# exportした関数のmock化
実装と別ファイルに定義した関数をimportして使う場合について。  

## 実装
```ts
export function multiplication(a: number, b: number) {
  return a * b;
}
```
``` ts
// ↑のファイルをimport
import { multiplication } from './sample';
export function twice(a: number) {
  return multiplication(a, 2);
}
```

## テストコード
```ts
jest.mock('multiplicationがあるファイルまでのパス', () => {
  // 一部のみモック化したいので元の実装を持っておく
  const original = jest.requireActual('multiplicationがあるファイルまでのパス');
  return {
    ...original,
    // テストで使う関数のみ固定値が返るようにする
    multiplication: jest.fn().mockReturnValue(10)
  }
});
describe('twice', () => {
  it('test', () => {
    const result = twice(5);
    expect(result).toBe(10);
  });
});

```

# Classのmock化
## 実装
```ts
export class Calcurator {
  public sum(a: number, b: number) {
    return a + b;
  }
}
```
``` ts
// テスト対象
export function add2(a: number) {
  return new Calcurator().sum(a, 2);
}
```

## テストコード
```ts
import { Calcurator } from './パス';
// mockImplementationがエラー吐くので必要
import { mocked } from 'ts-jest/utils';

jest.mock('../../../src/functions/CalcuratorClass');
describe('sum', () => {
  it('test', () => {
    mocked(Calcurator).mockImplementation(() => {
      return {
        sum: () => {
          return 5;
        },
      };
    });
    const result = add2(3);
    expect(result).toBe(5)
  });
});
```

# snapshotsテスト
`create-react-app`の初期状態からスタート。  
ただし、デフォだとjest落ちるので色々修正する。

## svgのimportをやめる
ライブラリを使えば解決できるがそこまでsvgのimportに拘らないので普通にcomponent化する。  
基本はsvgファイルの中身コピペ。CSSを当てる都合classNameだけ追加。  

``` ts
import React from 'react';
export const Logo: React.FC = () => (<svg className="App-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3"><g fill="#61DAFB"><path d="長いので割愛。初期値のコピペ" /><circle cx="420.9" cy="296.5" r="45.7" /><path d="M520.5 78.1z" /></g></svg>)
```

App.tsxから↑のファイルを読み込むようにすればOK。
```ts
import React from 'react';
import { Logo } from './Logo';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Logo/>
        {/* 以下初期値と同じ */}
      </header>
    </div>
  );
}
export default App;
```

## cssをimportできるようにする
こちらもデフォだと落ちるのでなんとかする。  
公式サイトにあったので同じ様に対応する。

### ライブラリ追加
``` shell
$ yarn add -D identity-obj-proxy 
```

### jest.config.js修正
```js
module.exports = {
  // ここを追加
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  }
};
```

## テストコード
snapshotsテスト用にライブラリを追加。

```shell
$ yarn add -D react-test-renderer @types/react-test-renderer
```

テストコードは下記の通り。  
```ts
import React from 'react';
import renderer from 'react-test-renderer';
import App from '../../src/App';

test('renders learn react link', () => {
  const result = renderer.create(<App />).toJSON();
  expect(result).toMatchSnapshot();
});
```

テストを実行して`__snapshots__`フォルダに`テストコードファイル.snap`が作成されていればOK。

# まとめ
一通りよく使いそうな項目についてまとめた。  
オブジェクトの比較とか特に気にせず`toEqual`使っていたので`toBe`との違いについて知れて良かった。  


# 参考リンク
* [Jest · 🃏快適なJavaScriptのテスト](https://jestjs.io/ja/)
* [Getting Started · Jest](https://jestjs.io/docs/ja/getting-started)
* [kulshekhar/ts\-jest: TypeScript preprocessor with sourcemap support for Jest](https://github.com/kulshekhar/ts-jest)
* [Expect · Jest](https://jestjs.io/docs/ja/expect)
* [CSSモジュールのモック](https://jestjs.io/docs/ja/webpack#css%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%A2%E3%83%83%E3%82%AF)