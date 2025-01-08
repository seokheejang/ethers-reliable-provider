import { hideBin } from 'yargs/helpers';
import Yargs from 'yargs/yargs';
import { multiCallCmd, timeoutCallCmd } from './command';

async function main() {
  await Yargs(hideBin(process.argv)).options({}).command(multiCallCmd).command(timeoutCallCmd).strict().demandCommand(1, 'a command must be specified').help().argv;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
