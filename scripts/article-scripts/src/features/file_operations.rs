use anyhow::{Context, Result};
use chrono::Local;
use clap::ArgMatches;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use uuid::Uuid;

pub struct FileOperations;

impl FileOperations {
    pub fn new() -> Self {
        Self
    }

    ///
    /// create template files.
    /// * `matches` - information about arguments.
    ///
    pub fn create_file(&self, matches: &ArgMatches) -> Result<()> {
        let file_name = matches
            .get_one::<String>("file-name")
            .map(ToString::to_string)
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        // 画像用のディレクトリ作成
        let image_dir = Path::new("public/images/article").join(&file_name);
        let md_dir = Path::new("src/md-pages").join(&file_name);
        fs::create_dir_all(&image_dir)
            .with_context(|| format!("Failed to create image directory: {:?}", image_dir))?;
        fs::create_dir_all(&md_dir)
            .with_context(|| format!("Failed to create markdown directory: {:?}", md_dir))?;

        let template_data = format!(
            "---\n\
        path: \"/blog/{}\"\n\
        date: \"{}\"\n\
        title: \"\"\n\
        tag: [\"\"]\n\
        thumbnailImage: \"/images/\"\n\
        odpImage: \"/images/\"\n\
        ---",
            file_name,
            Local::now().format("%Y/%m/%d").to_string()
        );

        let markdown_path = md_dir.join(format!("article{}.md", file_name));
        write(&template_data, markdown_path.to_str().unwrap())?;
        let image_path = image_dir.join(".gitkeep");
        write("", image_path.to_str().unwrap())?;
        Ok(())
    }

    ///
    /// rename image_files
    /// * `matches` - rename file directory.
    pub fn rename_images(&self, matches: &ArgMatches) -> Result<()> {
        let dir_name = matches
            .get_one::<String>("rename")
            .map(ToString::to_string)
            .unwrap_or_default();
        let dir_path = Path::new("public/images/article").join(&dir_name);

        for (index, entry) in fs::read_dir(&dir_path)
            .with_context(|| format!("Failed to read directory: {:?}", dir_path))?
            .filter_map(Result::ok)
            .filter(|e| e.file_type().map(|ft| ft.is_file()).unwrap_or(false))
            .enumerate()
        {
            let old_path = entry.path();
            let new_name = format!("ss{}-{}.png", dir_name, index + 1);
            let new_path = dir_path.join(new_name);

            fs::rename(&old_path, &new_path).with_context(|| {
                format!(
                    "Failed to rename {:?} to {:?}",
                    old_path.file_name().unwrap(),
                    new_path.file_name().unwrap()
                )
            })?;
        }

        Ok(())
    }
}

///
/// file output
///
/// * `s` - text
/// * `path` - output path
///
fn write(s: &str, path: &str) -> Result<()> {
    let mut f = File::create(path)?;

    if let Err(e) = f.write_all(s.as_bytes()) {
        eprintln!("Failed to write file: {:?}", e);
    };
    Ok(())
}
