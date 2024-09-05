use super::{file_operations::FileOperations, Command};
use anyhow::Result;
use clap::{Arg, ArgAction, ArgMatches, Command as ClapCommand};

pub struct ArticleCreator {
    file_ops: FileOperations,
}

impl ArticleCreator {
    pub fn new() -> Self {
        Self {
            file_ops: FileOperations::new(),
        }
    }

    pub fn cli() -> ClapCommand {
        ClapCommand::new("article creator")
            .version("0.0.2")
            .author("tminasen")
            .about("article utility tools")
            .arg(
                Arg::new("file-name")
                    .short('n')
                    .long("name")
                    .value_name("FILE_NAME")
                    .help("specify file name"),
            )
            .arg(
                Arg::new("rename")
                    .long("rename")
                    .value_name("TARGET_DIR_NAME")
                    .help("rename image files")
                    .action(ArgAction::Append),
            )
    }
}

impl Command for ArticleCreator {
    fn execute(&self, args: &ArgMatches) -> Result<()> {
        if args.contains_id("rename") {
            self.file_ops.rename_images(args)
        } else {
            self.file_ops.create_file(args)
        }
    }
}
