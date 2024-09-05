use anyhow::Result;
use article_scripts::{ArticleCreator, Command};

fn main() -> Result<()> {
    let matches = ArticleCreator::cli().get_matches();
    let creator = ArticleCreator::new();
    creator.execute(&matches)
}
