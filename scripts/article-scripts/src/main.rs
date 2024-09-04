mod features;

use anyhow::Result;
use features::cli_config::get_matches;
use features::file_operations::create_file;
use features::file_operations::rename_images;

fn main() -> Result<()> {
    let matches = get_matches();

    // フォーマット変更
    if matches.contains_id("rename") {
        rename_images(&matches)?;
        return Ok(());
    }
    // それ以外はファイル作成
    create_file(&matches)?;

    Ok(())
}
