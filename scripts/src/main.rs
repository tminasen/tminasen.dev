use std::iter;
use std::fs;
use std::fs::File;
use std::io;
use std::io::Write;
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use chrono::Local;

fn echo(s: &str, path: &str) -> io::Result<()> {
    let mut f = File::create(path)?;

    f.write_all(s.as_bytes())
}

fn main() {
    let mut rng = thread_rng();
    let rand_string: String = iter::repeat(()).map(|()| rng.sample(Alphanumeric)).take(20).collect();
    let dir_title: String = rand_string.to_lowercase();
    fs::create_dir_all(format!("src/md-pages/{}/images" ,dir_title)).unwrap_or_else(|why| {
        println!("! {:?}", why.kind());
    });
    let template_data = format!("---\n\
    path: \"/blog/{}\"\n\
    date: \"{}\"\n\
    title: \"\"\n\
    tag: [\"\"]\n\
    thumbnailImage: \"./images/\"\n\
    ---", dir_title, Local::now().format("%Y/%m/%d").to_string());
    
    let markdown_path: String = format!("src/md-pages/{}/article{}.md" ,dir_title ,dir_title);
    echo(&template_data, &markdown_path).unwrap_or_else(|why| {
        println!("! {:?}", why.kind());
    });
}
