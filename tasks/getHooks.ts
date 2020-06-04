import dotenv from 'dotenv'
import { Asana } from '../services';

dotenv.config();

const { ASANA_WORKSPACE_ID } = process.env;

(async () => {
  const hooks = await Asana.getHooks(ASANA_WORKSPACE_ID);
  if (hooks && hooks.length) {
    console.log(hooks);
  } else {
    console.log('No webhooks found for the specified Workspace ID: ', ASANA_WORKSPACE_ID);
  }
})()