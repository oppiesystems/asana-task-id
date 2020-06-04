import args from 'args';
import dotenv from 'dotenv'
import { Asana } from '../services';

dotenv.config();

args
  .option('webhookId', 'The webhook identifier to be deleted.');

const { webhookId } = args.parse(process.argv);

(async () => {
  console.log(`Deleting hook with id: '${webhookId}'`);
  await Asana.deleteHook(webhookId);
  console.log(`Webhook deleted!`);
})()