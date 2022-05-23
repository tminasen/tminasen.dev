import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const OGP_BASE_HTML = `file:${path.resolve(
  process.cwd(),
  './scripts/generate-ogp/ogp-base.html',
)}`;
const OGP_IMAGE_BASE_PATH = 'public/images/article/';
type OgpArticleMetaData = Record<'title' | 'date' | 'path', string>;

async function convertArticleMetaData(
  data: Record<string, any>,
): Promise<OgpArticleMetaData | undefined> {
  if (!data?.title || !data?.date || !data?.path) {
    return undefined;
  }
  const id = data.path.split('/')[2];
  return { title: data.title, date: data.date, path: id };
}

export function parseStringDate(stringDate: string): number {
  try {
    return Date.parse(stringDate);
  } catch {
    return 0;
  }
}

function sortArticleDescDate(a: OgpArticleMetaData, b: OgpArticleMetaData) {
  return parseStringDate(b.date) - parseStringDate(a.date);
}

async function getArticleMetaData() {
  const mdPagePath: string = path.join(process.cwd(), 'src/md-pages');
  const articleDirectories: string[] = fs.readdirSync(mdPagePath);
  const result: Array<OgpArticleMetaData | undefined> = [];
  for (const articleDir of articleDirectories) {
    const articleDirPath = path.join(mdPagePath, articleDir);
    const files = fs.readdirSync(articleDirPath);
    const file: string | undefined = files.filter(file =>
      file.endsWith('.md'),
    )[0];
    if (file === undefined) {
      throw new Error(`file is required. articleDirPath: ${articleDirPath}`);
    }
    const fileDetail = fs.readFileSync(
      path.join(mdPagePath, articleDir, file),
      'utf8',
    );
    const matterResult = matter(fileDetail, { excerpt: true });
    const metaData = await convertArticleMetaData(matterResult.data);
    result.push(metaData);
  }
  return result
    .filter((item): item is OgpArticleMetaData => item !== undefined)
    .sort(sortArticleDescDate);
}

(async () => {
  const metaData = await getArticleMetaData();
  for (const data of metaData) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.goto(OGP_BASE_HTML);
    await page.waitForSelector('#title');
    await page.evaluate(
      ({ title }) => {
        const titleElement = document.getElementById('title')!;
        titleElement.innerText = title;
      },
      { title: data.title },
    );
    const ogpDirectory = path.join(
      process.cwd(),
      OGP_IMAGE_BASE_PATH,
      data.path,
    );
    if (!fs.existsSync(ogpDirectory)) {
      fs.mkdirSync(ogpDirectory);
    }
    await page.screenshot({
      path: path.join(ogpDirectory, 'ogp.png'),
    });
    await browser.close();
  }
})();
