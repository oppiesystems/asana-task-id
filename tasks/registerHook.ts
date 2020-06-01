import args from 'args';
import dotenv from 'dotenv'
import { Asana } from '../services';

dotenv.config();

const { ASANA_PROJECT_ID } = process.env;

args
  .option('projectId', 'The project identifier to listen for with the webhook', ASANA_PROJECT_ID)
  .option('url', 'The webhook endpoint to be registered');

const { projectId, url } = args.parse(process.argv);

(async () => {
  await Asana.createHook(projectId, url);
  console.log(`Created hook for '${projectId}' on '${url}'`);
})()