use std::iter;
use std::fs;
use std::fs::File;
use std::io;
use std::io::Write;
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use chrono::Local;
use clap::{App, Arg, ArgMatches};

/// 
/// file output
/// 
/// * `s` - text 
/// * `path` - output path
///
fn write(s: &str, path: &str) -> io::Result<()> {
    let mut f = File::create(path)?;

    f.write_all(s.as_bytes())
}


///
/// create template files.
/// * `matches` - information about arguments.
/// 
fn create_file(matches: ArgMatches) {
    let file_name: String = match matches.value_of("file-name") {
        Some(name) => name.to_string(),
        None => {
            let mut rng = thread_rng();
            let rand_string: String = iter::repeat(()).map(|()| rng.sample(Alphanumeric)).take(20).collect();
            rand_string.to_lowercase()
        }
    };

    fs::create_dir_all(format!("src/md-pages/{}/images", file_name)).unwrap_or_else(|why| {
        println!("! {:?}", why.kind());
    });
    let template_data = format!("---\n\
    path: \"/blog/{}\"\n\
    date: \"{}\"\n\
    title: \"\"\n\
    tag: [\"\"]\n\
    thumbnailImage: \"./images/\"\n\
    ---", file_name, Local::now().format("%Y/%m/%d").to_string());

    let markdown_path: String = format!("src/md-pages/{}/article{}.md", file_name, file_name);
    write(&template_data, &markdown_path).unwrap_or_else(|why| {
        println!("! {:?}", why.kind());
    });
}

///
/// rename image_files
/// * `matches` - rename file directory.
fn rename_images(matches: ArgMatches) -> io::Result<()> {
    let dir_name: String = match matches.value_of("rename") {
        Some(name) => name.to_string(),
        _ => "".to_string()
    };

    let mut index = 1;
    fs::read_dir(format!("src/md-pages/{}/images", dir_name))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            if entry.file_type().ok()?.is_file() {
                Some(entry.file_name().to_string_lossy().into_owned())
            } else {
                None
            }
        })
        .for_each(move |file| {
            let before_filename = format!("src/md-pages/{}/images/{}", dir_name, file);
            let after_filename = format!("src/md-pages/{}/images/ss{}-{}.png", dir_name, dir_name, index);
            fs::rename(before_filename, after_filename);
            index += 1;
        });
    Ok(())
}

fn main() {
    let matches = App::new("article creator")
        .version("0.0.1")
        .author("tminasen")
        .about("article utility tools")
        .arg(Arg::with_name("file-name")
            .short("n")
            .long("name")
            .value_name("FILE_NAME")
            .help("specify file name")
            .takes_value(true)
            .required(false)
        )
        .arg(Arg::with_name("rename")
            .long("rename")
            .value_name("TARGET_DIR_NAME")
            .help("rename image files")
            .takes_value(true)
            .multiple(true)
            .required(false)
        )
        .get_matches();

    // フォーマット変更
    if matches.is_present("rename") {
        rename_images(matches);
        return;
    }
    // それ以外はファイル作成
    create_file(matches);
}
