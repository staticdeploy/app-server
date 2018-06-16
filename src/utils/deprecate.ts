// tslint:disable:no-console
import chalk from "chalk";

export default function deprecate(message: string) {
    console.log();
    console.log(chalk.red(`[DEPRECATION WARNING] ${message}`));
    console.log();
}
