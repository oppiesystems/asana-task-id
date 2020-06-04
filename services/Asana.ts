import { AsanaEvent } from "../interfaces/Asana";
import * as Asana from "asana";

const TASK_PREFIX_PATTERN = /\[(.+?)\]/;

const registerClient = (): Asana.Client => {
  return Asana.Client.create().useAccessToken(process.env.ASANA_ACCESS_TOKEN);
};

export const createHook = async (projectId: string, url: string) => {
  const client = registerClient();
  // TODO: Add 'added'-only filter to the webhook registration
  const data = {};
  await client.webhooks.create(projectId, url, data);
};

export const handleHook = async (body: { events: AsanaEvent[] }) => {
  const isWatchChangeEvents = process.env.WATCH_CHANGES === "true";
  const isActiveEvent = (x: AsanaEvent) => x.action === "added" || (isWatchChangeEvents && x.action === "changed");
  const filterTaskResource = (x: AsanaEvent) =>
    x.resource.resource_type === "task" && (!x.parent || x.parent.resource_type === "project");

  const activeTasks = body.events
    .filter(isActiveEvent)
    .filter(filterTaskResource);

  if (activeTasks && activeTasks.length) {
    const client = registerClient();
    const project = await client.projects.findById(process.env.ASANA_PROJECT_ID);
    const currentId = await getProjectCurrentId(project);

    let updatedId = currentId;
    for (let task of activeTasks) {
      const currentTask = await client.tasks.findById(task.resource.gid);
      const isTaskPrefixAlreadyExists = !!currentTask.name.match(TASK_PREFIX_PATTERN);
      if (!isTaskPrefixAlreadyExists) {
        updatedId++;
        const name = createUpdatedTaskName(currentTask, updatedId);
        await client.tasks.update(task.resource.gid, { name });
        console.log(`Task updated: '${name}'`);
      }
    }

    if (updatedId > currentId) await setProjectCurrentId(client, updatedId);
  }
};

export const getHooks = async (workspaceId: string) => {
  const client = registerClient();
  const response = await client.webhooks.getAll(workspaceId);
  return response.data;
}

export const deleteHook = async (webhookId: string) => {
  const client = registerClient();
  await client.webhooks.deleteById(webhookId);
}

export const getProjectCurrentId = async (
  project: Asana.resources.Projects.Type
): Promise<number> => {
  const match = project.notes.match(TASK_PREFIX_PATTERN);
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

export const createUpdatedTaskName = (
  currentTask: Asana.resources.Tasks.Type,
  updatedId: number,
): string => {
  const taskPrefix = `[${process.env.ASANA_PROJECT_PREFIX}-${updatedId}]`;
  return `${taskPrefix} ${currentTask.name}`;
};
