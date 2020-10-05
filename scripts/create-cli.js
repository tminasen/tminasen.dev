'use strict';
const fs = require('fs');
const path = require('path');
// 作成日時(YYY-MM-DD)
const createDate = process.argv[2];
// ハイフン抜き作成日時(YYYYMMDD)
const removeHyphen = createDate.replace(/-/g, '');
// マークダウンのテンプレート
const templateData = `---
path: "/blog/${removeHyphen}"
date: "${createDate}"
title: ""
tag: [""]
thumbnailImage: "./images/"
---`;
fs.mkdirSync(path.join(__dirname, `../src/md-pages/${removeHyphen}`));
fs.mkdirSync(path.join(__dirname, `../src/md-pages/${removeHyphen}/images`));
fs.writeFileSync(
  path.join(
    __dirname,
    `../src/md-pages/${removeHyphen}/article${removeHyphen}.md`,
  ),
  templateData,
  {
    encoding: 'utf8',
  },
);
