---
path: "/blog/d6f6d3ab551ced8d819c9170ff05a7"
date: "2021/03/13"
title: "Recoilことはじめ"
tag: ["React"]
ogpImage: "/images/article/d6f6d3ab551ced8d819c9170ff05a7/ogp.png"
thumbnailImage: "/images/article/d6f6d3ab551ced8d819c9170ff05a7/ssd6f6d3ab551ced8d819c9170ff05a7-2.png"
---

# はじめに

Recoilが気になっていた今日このごろ。  
気になった時が触りどきなので試してみる回。

# TL;DR.

[コード](https://github.com/Tetsuya-Minase/program-samples/tree/master/recoil-sample)

# 導入

```bash
$ npx create-react-app recoil-tutorial
$ cd recoil-tutorial
$ yarn add recoil
```

# 使ってみる

[Getting Started](https://recoiljs.org/docs/introduction/getting-started)を参考にしながら簡単なカウンターを作ってみる。

## RecoilRoot

recoilのstateを利用するために必要。  
実際にstateを使うコンポーネントの親の中で呼び出されていればOK。  
おすすめはrootコンポーネント。

```tsx
import './App.css';
import {RecoilRoot} from 'recoil';

function App() {
  return (
    <RecoilRoot>
      {/* ここにstateを使うコンポーネントを入れる */}
    </RecoilRoot>
  );
}

export default App;
```

## Atom

Atomは状態の一部。  
Atomの読み書きは任意のコンポーネントできる。  
が、Atomを読み込んだコンポーネントは暗黙的にサブスクライブすることになるのでAtomが更新されると再描画される。

```tsx
import {atom} from "recoil";

const countState = atom({
  key: 'count', // uniq id
  default: 0 // default value(initial value)
});
```

Atomからの値の読み込み、Atomの更新は`useRecoilState`を使う。

```tsx
import {atom, useRecoilState} from 'recoil';

const countState = atom({
  key: 'count', // uniq id
  default: 0 // default value(initial value)
});

const useCountClick = () => {
  const [count, setCount] = useRecoilState<number>(countState);
  const onClick = () => setCount(count + 1);
  return <button onClick={onClick}>+1</button>;
}

export const Counter = () => {
  return (
    <>
      {useCountClick()}
    </>
  )
}
```

## Selector

SelectorはAtomの持っているから派生した(変換した)状態を取得できる。  
状態を何らかの方法で修正する純粋な関数の出力と考えられる。

```tsx
import {selector} from 'recoil';

const selectEvenNumber = selector({
  key: 'selectEvenNumber', // uniq id
  get: ({get}) => {
    const count = get(countState);
    return count % 2 === 0 ? 'Yes' : 'No';
  }
});
```

selectorの値を読み取るには`useRecoilValue`を使う。  
サンプルの全量は下記の通り。

```tsx
import {atom, selector, useRecoilState, useRecoilValue} from "recoil";

const countState = atom({
  key: 'count',
  default: 0
});
const selectEvenNumber = selector({
  key: 'selectEvenNumber',
  get: ({get}) => {
    const count = get(countState);
    return count % 2 === 0 ? 'Yes' : 'No';
  }
});
const useCountClick = () => {
  const [count, setCount] = useRecoilState<number>(countState);
  const onClick = () => setCount(count + 1);
  return <button onClick={onClick}>+1</button>;
}
const useCheckCount = () => {
  const [count,] = useRecoilState<number>(countState);
  const isEven = useRecoilValue(selectEvenNumber);
  return <div>
    is {count} even? {isEven}
  </div>
}

export const Counter = () => {
  return (
    <>
      {useCountClick()}
      {useCheckCount()}
    </>
  )
}
```

# もっと使ってみる

簡単なTodoListを作ってもっとちゃんと使ってみる。

## TodoListを作成する

リストをテーブル形式で表示する。  
Todoリストの中身は以下のような項目を想定している。

```tsx
{
  // TODOリストのid想定重複なし
  readonly
  id: number;
  // やることの内容
  readonly
  value: string;
  // 完了予定日
  readonly
  completionDate: string;
  // 完了しているかどうかのフラグ
  readonly
  isCompleted: boolean;
}
```

またselectorを試したかったので表示するときは下記のように変更する。

```tsx
{
  readonly
  id: number;
  readonly
  value: string;
  readonly
  completionDate: string;
  // フラグを'完了' / '未完了'の文字列に変換する
  readonly
  completed: string;
}
```

サンプルのデータはこんな感じ。

```tsx
const item = [
  {id: 1, value: 'サンプルプログラムを書く', completionDate: '2021-03-10', isCompleted: true},
  {id: 2, value: 'テストコード書く', completionDate: '2021-03-11', isCompleted: false},
  {id: 3, value: '記事を書く', completionDate: '2021-03-12', isCompleted: false}
];
```

これを表示するコンポーネントは下記のようにした。  
CSSについては[こちら](https://github.com/Tetsuya-Minase/program-samples/blob/master/recoil-sample/src/components/List/List.css)
を参照。

```tsx
export const List = () => {
  const item = [/* ↑のアイテム */];
  return <dl className="list">
    <div className="list__label">
      <dt className="list__title">id</dt>
      <dt className="list__title">やること</dt>
      <dt className="list__title">完了日</dt>
      <dt className="list__title">状態</dt>
    </div>
    {item.map(({id, value, completionDate, completed}) => {
      return <div key={id} className="list__item">
        <dd className="list__value">{id}</dd>
        <dd className="list__value">{value}</dd>
        <dd className="list__value">{completionDate}</dd>
        <dd className="list__value">{completed}</dd>
      </div>
    })}
  </dl>
}
```

画像の様に表示されればOK。  
![リスト表示の画像](/images/article/d6f6d3ab551ced8d819c9170ff05a7/ssd6f6d3ab551ced8d819c9170ff05a7-2.png)

## 外部から値を取れるようにしてみる

実際には固定値で表示することは無いと思うので、モックのAPIを作ってそこから取得してみる。  
まずは準備としてAtomとSelectorを用意する。

```tsx
export interface TodoListState {
  // dataの件数
  readonly count: number;
  // 上記のサンプルと同じ
  readonly data: Array<{
    readonly id: number;
    readonly value: string;
    readonly completionDate: string;
    readonly isCompleted: boolean;
  }>;
}

export const todoListState = atom<TodoListState>({
  key: 'TODO_LIST_STATE',
  default: {count: 0, data: []}
});

export interface TodoListView {
  readonly count: number;
  readonly data: Array<{
    readonly id: number;
    readonly value: string;
    readonly completionDate: string;
    // 表示用にフラグを文言に変えた値
    readonly completed: string;
  }>;
};

export const getTodoListView = selector({
  key: 'TODO_LIST_SELECTOR',
  get: ({get}): TodoListView => {
    const todoList = get(todoListState);
    return {
      count: todoList.count,
      // フラグだけ変換してほかはそのまま返す
      data: todoList.data.map(data => ({...data, completed: data.isCompleted ? '完了' : '未完了'}))
    }
  }
});
```

次に実際にリクエストを送ってデータを取ってくる。  
CQRSっぽくするためリクエストを送りデータを更新する処理とデータを読み込む処理を別にしてみた。  
※サーバは最初のitemの内容を返すものを作った。詳細は[こちら](https://github.com/Tetsuya-Minase/program-samples/blob/master/recoil-sample/server/app.js)
を参照。

```tsx
type Method = 'GET' | 'POST';
// fetchAPIをラップした関数を用意する
const fetchClient = async <B, R>(url: string, method: Method, body?: B): Promise<R | Error> => {
  const request: RequestInit = {
    method,
    headers: new Headers({'Content-Type': 'application/json'}),
    body: JSON.stringify(body)
  }
  const response = await fetch(url, request);
  if (!response.ok) {
    console.log('error');
    return new Error('Response Error');
  }
  return response.json();
};
// Get専用の関数を用意しておく
export const get = async <R>(url: string): Promise<R | Error> => {
  return await fetchClient<never, R>(url, 'GET');
};

// Fetchしてくる用の関数
export const useFetchList = () => {
  // setterだけ欲しいのでuseRecoilStateではなく、useSetRecoilStateを使う
  const setState = useSetRecoilState<TodoListState>(todoListState);
  useEffect(() => {
    (async () => {
      // モック用のサーバにリクエストを送る
      const result = await get<TodoListState>('http://localhost:8080/api/v1/json');

      if (result instanceof Error) {
        return;
      }
      setState(result);
    })();
  }, []);
};

// 更新したデータを表示系データに整形して取得する
export const useGetListData = () => {
  return useRecoilValue<TodoListView>(getTodoListView);
};
```

これで外部から値が取得できるようになった。  
最終的に元のコンポーネントを下記の様に修正。

```tsx
export const List = () => {
  useFetchList();
  const result = useGetListData();
  return <dl className="list">
    <div className="list__label">
      <dt className="list__title">id</dt>
      <dt className="list__title">やること</dt>
      <dt className="list__title">完了日</dt>
      <dt className="list__title">状態</dt>
    </div>
    {result.data.map(({id, value, completionDate, completed}) => {
      return <div key={id} className="list__item">
        <dd className="list__value">{id}</dd>
        <dd className="list__value">{value}</dd>
        <dd className="list__value">{completionDate}</dd>
        <dd className="list__value">{completed}</dd>
      </div>
    })}
  </dl>
}
```

## フォームを作る

次にTodoを追加するようのフォームを作成する。  
フォームの作成には[React Fook Form](https://react-hook-form.com/)を使うことにした。  
そのため、`yarn add react-hook-form`でライブラリを追加しておく。  
CSSについては割愛するので詳細は[こちら](https://github.com/Tetsuya-Minase/program-samples/blob/master/recoil-sample/src/components/Form/Form.css)
。

```tsx
// 登録データ用の型定義
export interface TodoItem {
  readonly value: string;
  readonly completionDate: string;
  readonly isCompleted: boolean;
}

export const Form = () => {
  const {register, handleSubmit} = useForm<TodoItem>();
  // submitされた時の処理
  const submit = data => console.log(data);

  return <form className="form" onSubmit={handleSubmit(submit)}>
    {/* やることは必須 */}
    <label className="form__item">やること：<input name="value" ref={register({required: true})}></input></label>
    {/* 完了日は必須 */}
    <label className="form__item">完了日：<input type="date" name="completionDate" ref={register({required: true})}></input></label>
    {/* チェックボックスは必須ではない。ただし、setValueAsを使って明示的にbooleanに変換する。 */}
    <label className="form__item">完了済<input type="checkbox" name="isCompleted"
                                            ref={register({setValueAs: value => !!value})}></input></label>
    <button type="submit">登録</button>
  </form>;
};
```

画像の様に表示されればOK。
![フォームの画像](/images/article/d6f6d3ab551ced8d819c9170ff05a7/ssd6f6d3ab551ced8d819c9170ff05a7-1.png)

## バリデーションエラーの際にメッセージを表示する

`useForm`の`errors`を使うことでバリデーションエラーを検知することができる。  
そこでバリデーションエラーになった際にはその旨のメッセージを表示するようにコンポーネントを修正する。

```tsx
// エラーメッセージを表示するようの関数。
// 項目応じてメッセージを出し分ける。
const errorMessage = (errors: DeepMap<TodoItem, FieldError>, todoItemKey: keyof TodoItem) => {
  switch (todoItemKey) {
    case 'value':
      return errors.value ? <span className="form__error">やることは必須です。</span> : null;
    case 'completionDate':
      return errors.completionDate ? <span className="form__error">完了日は必須です。</span> : null;
    default:
      return null;
  }
}

export const Form = () => {
  const {register, handleSubmit, errors} = useForm<TodoItem>();
  const submit = data => console.log(data);

  return <form className="form" onSubmit={handleSubmit(submit)}>
    <label className="form__item">やること：<input name="value" ref={register({required: true})}></input></label>
    {/* errorsとどこのメッセージかを渡す */}
    {errorMessage(errors, 'value')}
    <label className="form__item">完了日：<input type="date" name="completionDate" ref={register({required: true})}></input></label>
    {errorMessage(errors, 'completionDate')}
    <label className="form__item">完了済<input type="checkbox" name="isCompleted"
                                            ref={register({setValueAs: value => !!value})}></input></label>
    <button type="submit">登録</button>
  </form>;
};
```

## リクエストを送れるようにする

こちらもリクエストを送るのを試してみる。  
サーバの内容については[こちら](https://github.com/Tetsuya-Minase/program-samples/blob/master/recoil-sample/server/app.js)を参照。

```tsx
// fetchClientのPOST用を作成する
export const post = async <R, B>(url: string, body: B): Promise<R | Error> => {
  return await fetchClient<B, R>(url, 'POST', body);
};

export const useSubmit = () => {
  // stateの更新用なのでuseSetRecoilStateを使う
  const setState = useSetRecoilState<TodoListState>(todoListState);
  // useRecoilStateなどを使うと呼び出したタイミングの値しか取れないため、useRecoilCallbackを使い取得する。
  const submit = useRecoilCallback(({snapshot}) => async (data: TodoItem) => {
    const response = await post<TodoItemResponse, TodoItem>('http://localhost:8080/api/v1/json', data);
    if (response instanceof Error) {
      return;
    }
    // 現在のstateを取得
    const currentState = await snapshot.getPromise(todoListState);
    // 表示上だけ登録されたデータを追加(改めて読み直すのではなく一旦見た目だけ更新)
    setState({count: currentState.count + 1, data: [...currentState.data, response.result]});
  }, []);
  return submit;
};
```

これを使いコンポーネントを↓の様に修正した。

```tsx
export const Form = () => {
  const {register, handleSubmit, errors} = useForm<TodoItem>();
  // 登録時に↑で作ったメソッドを使うようにする
  const submit = useSubmit();
  return <form className="form" onSubmit={handleSubmit(submit)}>
    <label className="form__item">やること：<input name="value" ref={register({required: true})}></input></label>
    {errorMessage(errors, 'value')}
    <label className="form__item">完了日：<input type="date" name="completionDate" ref={register({required: true})}></input></label>
    {errorMessage(errors, 'completionDate')}
    <label className="form__item">完了済<input type="checkbox" name="isCompleted"
                                            ref={register({setValueAs: value => !!value})}></input></label>
    <button type="submit">登録</button>
  </form>;
};
```

これでTodoListの表示と値を追加するフォームを作成することができた。

# まとめ

`Recoil`とついでに`React Hook Form`を試してみた。  
個人的にRecoilはReduxよりも手軽に使える気がした。  
ReduxだとAction作ったりReducer作ったり簡単な状態管理だとしても、結構仰々しくなってしまうイメージがある。  
対してRecoilだとhooks感覚(useState)の様に使えるので、Reduxに比べると手軽に使える印象を受けた。  
ただ、大規模なシステムでSPAのstateをReduxで一括管理みたいなことをしている場合はどっちが良いのかはちょっとわからなかった。
自分はサクッと使えるところに現状魅力を感じているので使える機会があれば積極的に使っていきたい。

# 関連リンク

- [Recoil](https://recoiljs.org/)
- [Home \| React Hook Form \- Simple React forms validation](https://react-hook-form.com/)