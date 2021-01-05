---
path: "/blog/oaputhved38ajekgpcz9"
date: "2020/10/12"
title: "Rust事始め"
tag: ["Rust"]
thumbnailImage: "/images/ogp.png"
---

# はじめに
巷で話題になっているので気になったRustを触ってみる。  
[実践Rustプログラミング入門](https://www.shuwasystem.co.jp/book/9784798061702.html)の最初の方まで読み終わったので、  
[Rust by Example 日本語版](https://doc.rust-jp.rs/rust-by-example-ja/index.html)の序盤の方をを進めていく。  
後半については実際に使ってみたほうが早そうなので。

# TL;DR.
- [ソースコード](https://github.com/Tetsuya-Minase/program-samples/tree/master/rust-sample)

# 基本文法
```rust
//! ドキュメントコメントを書きたい場合の書き方は2通りある。    
//! `/`3つのときはこのコメントの下の内容に対するドキュメントになる。  
//! `//!`で書いた場合はこのソースコードに対するコメントになる。  
//! ドキュメントコメントはマークダウン形式で書ける。  
//! コードブロックも書くことができる。  
//! ```
//! fn hoge() {
//!   prntln!("hoge!");
//! }
//! ```
//! ドキュメントコメントを出力するには`cargo doc`でできる。  
//! ブラウザで見たければ、`cargo doc --open`

// 外のファイルにある関数を使えるようにモジュール化する
mod struct_sample;
mod enum_sample;
mod constant_sample;

/// こちらのコメントはmain関数に対するコメント。  
/// 基本文法のサンプルを書いていく
fn main() {
    // コメントは`/`2つ
    /* これで
     * ブロックコメントが書ける
     * この2つのコメントはコンパイラに無視される
    */
  
    // フォーマットしてプリントするやり方は複数ある
    format!("テキストを文字列に書き込むだけ。そのため標準出力には出てこない。");
    print!("format!と同じだが、標準出力に出てくる。");
    println!("print!と同じだが、一行毎に改行される。");
    println!("途中になにか入れたい場合は、{}とすればそこに挿入される。", "test");
    println!("順番の指定もできる。一個目: {0} / 二個目: {1} / 一個目: {0}", "hoge", "huga");
    println!("名前の指定もできる。 id: {id} / name: {name} / age: {age}", id="0001", name="Piyota", age="20");
    eprint!("print!と同じ。こちらは標準エラーに出力される");
    eprintln!("println!と同じ。こちらは標準エラーに出力される");
    // 変数宣言はlet。型定義は変数名の後ろに`:型名`で定義
    // 1文字はchar。
    let char1: char = 'a';
    // 文字列はString
    let str1: String = String::from("Hello World!");
    // 符号付き整数はi8, i16, i32, i64, i128, isize(ポインタのサイズ)になる
    let num1: i32 = 10;
    // サフィックスで型指定可能
    let num2 = 10i32;
    // 符号なし整数もある。u8, i16, u32, u64, u128, usize(ポインタのサイズ)
    let num3: u32 = 100;
    // 浮動小数点。f32 or f64
    let float1: f32 = 3.141592;
    // 真偽値。true / false
    // 使わない変数は頭に`_`をつけて置かないとbuild時に警告が出る(なので、ホントは全部付けた方が良い)
    let _boolean: bool = true;
    
    // 型定義は書かなくても推論してくれる
    let char2 = 'b';
    // 整数はi32がデフォルト
    let num4 = 10;
    // 小数の場合はf64がデフォルト
    let float2 = 1.41421356;
  
    // 変数は基本的にimmutable。
    let sample = 1000;
    // ↓のように再代入しようとするとcannot assign twice to immutable variable `sample` と怒られる
    // sample = 10;
  
    // mutをつけるとmutableになる
    let mut sample2 = 1;
    sample2 = 2;
    // mutableでも型は変えられない
    // ↓のように変更しようとすると、mismatched types expected integer, found `bool` と怒られる
    // `sample2 = true;`
    // 変数はshadowingで上書き可能
    let sample2 = true;
  
    // 配列。[型; 要素数]で型定義できる
    let list: [i32; 3] = [1, 3, 5];
    // タプル。(型, 型,...)で型定義できる
    let tuple: (i32, bool, char) = (1, true, 'c');

    // `struct_sample.rs`の`struct_sample`を実行
    struct_sample::struct_sample();

    // `enum_sample.rs`の`enum_sample`を実行
    enum_sample::enum_sample();
    enum_sample::enum_use_sample();

		// `constant_sample.rs`の`constant_sample`を実行
    constant_sample::constant_sample();
  }
```

# 構造体について
```rust
//! 構造体のサンプル  
//! 構造体はstructで宣言できる
//! 種類は3つあり、
//! * タプル(名前付きタプル)
//! * C言語スタイルの構造体
//! * ユニット。これはフィールドを持たず、ジェネリック型を扱う際に有効です

struct Person<'a> {
  // The 'a defines a lifetime
  name: &'a str,
  age: u8,
}

// ユニット
struct Nil;
// タプル
struct Pair(i32, f32);
// C言語スタイルの構造体
struct Point {
  x: f32,
  y: f32,
}
// 構造体は構造体のフィールドになれる
struct Rectangle {
  top_left: Point,
  bottom_right: Point,
}

pub fn struct_sample() {
  // 変数から構造体を作成する
  let name = "Peter";
  let age = 27;
  let peter = Person { name, age };
  // 変数を経由しなくても問題なし
  let bob = Person {
    name: "bob",
    age: 20,
  };

  // Pointをインスタンス化
  let point: Point = Point { x: 10.3, y: 0.4 };
  // pointのフィールドにアクセスする。
  println!("point coordinates: ({}, {})", point.x, point.y);
  // 構造体から別の構造体を作成する
  // 指定しなかった要素は元の要素を引き継ぐ
  let another_point = Point { x: 20.3, ..point };
  // anotherPoint.yはpoint.yと同じ値になる
  println!("second point: ({}, {})", another_point.x, another_point.y);

  // `let`を使用してpointを分解できる
  let Point {
    x: point_x,
    y: point_y,
  } = point;
  println!("pointX: {}, pontY: {}", point_x, point_y);

  let _rectangle = Rectangle {
    // 構造体の定義とインスタンスの作成を同時に行う
    top_left: Point {
      x: point_x,
      y: point_y,
    },
    bottom_right: another_point,
  };

  // ユニットをインスタンス化
  let _nil = Nil;

  // タプルをインスタンス化
  let pair = Pair(1, 0.1);

  // タプルの値を取り出す
  println!("pair contains {:?} and {:?}", pair.0, pair.1);

  // タプルも構造体と同じく分解できる
  let Pair(integer, decimal) = pair;

  println!("pair contains {:?} and {:?}", integer, decimal);
}
```

# Enumについて
```rust
enum WebEvent {
  // Unitっぽい定義
  PageLoad,
  PageUnload,
  // タプルっぽい定義もできる
  KeyPress(char),
  Paste(String),
  // c言語風構造体っぽくも定義できる
  Click { x: i32, y: i32 },
}

// 名称が長すぎるか一般的な場合、TypeAliasを使って変更できる
enum VeryVerboseEnumOfThingsToDoWithNumbers {
  Add,
  Subtract,
}
// type alias作成
type Operations = VeryVerboseEnumOfThingsToDoWithNumbers;
// これ(type alias)がよく使われるのはimplブロックでselfを参照したとき
impl VeryVerboseEnumOfThingsToDoWithNumbers {
  fn run(&self, x: i32, y: i32) -> i32 {
    match self {
      Self::Add => x + y,
      Self::Subtract => x - y,
    }
  }
}

// 渡されたWebEvent野無いようによって出力する文字を変える
// 戻り値がない関数はユニット型`()`を戻り値の型に指定する(なくてもエラーにはならない)
fn inspect(event: WebEvent) -> () {
  // matchは他言語で言うところのswitchのようなもの
  match event {
    WebEvent::PageLoad => println!("page loaded"),
    WebEvent::PageUnload => println!("page unloaded"),
    // enumから値を取り出す
    WebEvent::KeyPress(c) => println!("pressed '{}'.", c),
    WebEvent::Paste(s) => println!("pasted \"{}\".", s),
    // clickから値を取り出す
    WebEvent::Click { x, y } => {
      println!("clicked at x={}, y={}.", x, y);
    }
  }
}

pub fn enum_sample() {
  // KeyPressにxを渡す
  let pressed_key = WebEvent::KeyPress('x');
  // Paseteに文字列を渡す(`.to_owned`でStringに変換)
  let pasted = WebEvent::Paste("my text".to_owned());
  let click = WebEvent::Click { x: 20, y: 80 };
  let load = WebEvent::PageLoad;
  let unload = WebEvent::PageUnload;

  inspect(pressed_key);
  inspect(pasted);
  inspect(click);
  inspect(load);
  inspect(unload);

  // type aliasを介して参照できる
  let add = Operations::Add;
}

enum Status {
  Rich,
  Poor,
}

enum Work {
  Civilian,
  Soldier,
}

pub fn enum_use_sample() {
  // `use`することで絶対名でなくとも使用可能になる。
  use Status::{Poor, Rich};
  // `Work`の中の名前をすべて`use`する
  use Work::*;

  // `use`しているため、`Status::Poor`と書いていることに等しい
  let status = Poor;
  // こちらも同様に`Work::Civilian`に等しい
  let work = Civilian;

  match status {
      // `use`しているのでスコープを明示していない
      Rich => println!("The rich have lots of money!"),
      Poor => println!("The poor have no money..."),
  }

  match work {
      // こちらも同じ
      Civilian => println!("Civilians work!"),
      Soldier  => println!("Soldiers fight!"),
  }
}
```

# 定数について
```rust
// グローバル変数はあらゆるスコープの外で宣言する
// Rustの定数には`static`と`const`があり、型を明示する必要がある
// スタティックなライフタイムを持つミュータブルな値
static LANGUAGE: &str = "Rust";
// `const`で宣言すると不変な値となる(通常はこっちを使う)
const THRESHOLD: i32 = 10;

fn is_big(n: i32) -> bool {
  // 関数内から定数を参照
  n > THRESHOLD
}

pub fn constant_sample() {
  let n = 16;

  // main 関数の中から定数を参照
  println!("This is {}", LANGUAGE);
  println!("The threshold is {}", THRESHOLD);
  println!("{} is {}", n, if is_big(n) { "big" } else { "small" });

  // 定数は変更不可なので↓はエラーになる
  // THRESHOLD = 5;
}
```

# クレートについて
クレートは他言語で言うところのライブラリに当たるもの。  
`Cargo.toml`の`[dependencies]`にクレート名とバージョンを記載すれば、ビルド時にダウンロードしてきてくれる。  
公開されているクレートについては、[crates.io: Rust Package Registry](https://crates.io/)で検索できる。  
(nodeで言うところの[npm | build amazing things](https://www.npmjs.com/)のようなものの認識)

もし、手動で追加するのがめんどくさい場合、`[cargo-edit](https://github.com/killercup/cargo-edit)`を使うと楽に追加できる。

```bash
# cargo-editのインストール
$ cargo install cargo-edit

# クレートを追加するときは`cargo add クレート名`を使う
# 今回はrandというクレートを追加
$ cargo add rand
>    Updating 'https://github.com/rust-lang/crates.io-index' index
>      Adding rand v0.7.3 to dependencies

# 削除したいときは`cargo rm クレート名`を使う
# randというクレートを削除
$ cargo rm rand
>    Removing rand from dependencies
```

# まとめ
今回は[Introduction - Rust By Example 日本語版](https://doc.rust-jp.rs/rust-by-example-ja/index.html)の11、12章あたりまでやった。  
(他の言語でもよくあるようなものは飛ばしつつ)  
触った感想としては、コンパイラがとても親切設計なので英語さえ毛嫌いしなければ快適に開発できそう。  
次は簡単な何かを作ってみようと思う。

# 参考
- [Introduction - Rust By Example 日本語版](https://doc.rust-jp.rs/rust-by-example-ja/index.html)
- [実践Rustプログラミング入門 - 秀和システム あなたの学びをサポート！ おかげさまで40周年を迎えました](https://www.shuwasystem.co.jp/book/9784798061702.html)
- [crates.io: Rust Package Registry](https://crates.io/)
- [killercup/cargo-edit: A utility for managing cargo dependencies from the command line.](https://github.com/killercup/cargo-edit)
