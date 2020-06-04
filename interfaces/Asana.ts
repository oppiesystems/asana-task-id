export interface AsanaEvent {
  users: object;
  created_at: string;
  action: 'added' | 'deleted' | 'changed';
  parent?: AsanaResource;
  resource: AsanaResource;
}

export interface AsanaResource {
  gid: string;
  resource_type: 'project' | 'task';
  resource_subtype: 'default_task';
}