use clap::{Arg, ArgAction, ArgMatches, Command};

pub fn get_matches() -> ArgMatches {
    Command::new("article creator")
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
        .get_matches()
}
