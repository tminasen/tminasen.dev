pub mod article_creator;
pub mod file_operations;

use anyhow::Result;
use clap::ArgMatches;

pub trait Command {
    fn execute(&self, args: &ArgMatches) -> Result<()>;
}
