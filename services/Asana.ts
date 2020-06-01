import { AsanaEvent } from "../interfaces/Asana";
import * as Asana from "asana";

const TASK_ID_PATTERN = /\[(.+?)\]/;

const registerClient = (): Asana.Client => {
  return Asana.Client.create().useAccessToken(process.env.ASANA_ACCESS_TOKEN);
};

export const createHook = async (projectId: string, url: string) => {
  const client = registerClient();
  // TODO: Add 'added'-only filter to the webhook registration
  const data = {};
  await client.webhooks.create(projectId, url, data);
};

export const handleHook = async (body: { events?: AsanaEvent[] }) => {
  const isAddedEvent = (x: AsanaEvent) => x.action === "added";
  const filterTaskResource = (x: AsanaEvent) =>
    x.resource.resource_type === "task" && x.parent.resource_type === "project";

  const addedTasks = body && body.events ? body.events
    .filter(isAddedEvent)
    .filter(filterTaskResource) : [];

  if (addedTasks && addedTasks.length) {
    const client = registerClient();
    const project = await client.projects.findById(process.env.ASANA_PROJECT_ID);
    const currentId = await getProjectCurrentId(project);

    let updatedId = currentId;
    for (let task of addedTasks) {
      updatedId++;
      const name = await createUpdatedTaskName(client, task, updatedId);
      await client.tasks.update(task.resource.gid, { name });
      console.log(`Task updated: '${name}'`);
    }

    await setProjectCurrentId(client, updatedId);
  }
};

export const getProjectCurrentId = async (
  project: Asana.resources.Projects.Type
): Promise<number> => {
  const match = project.notes.match(TASK_ID_PATTERN);
  return match ? parseInt(match[1], 10) : 0;
};

export const setProjectCurrentId = async (
  client: Asana.Client,
  id: number,
) => {
  // TODO: Regex update to the existing notes value instead of overwrite
  const notes = `[${id}]`;
  await client.projects.update(process.env.ASANA_PROJECT_ID, { notes });
};

export const createUpdatedTaskName = async (
  client: Asana.Client,
  task: AsanaEvent,
  updatedId: number,
): Promise<string> => {
  const currentTask = await client.tasks.findById(task.resource.gid);
  const taskPrefix = `[${process.env.ASANA_PROJECT_PREFIX}-${updatedId}]`;
  return `${taskPrefix} ${currentTask.name}`;
};
