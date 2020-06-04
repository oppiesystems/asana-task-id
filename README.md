# asana-task-id

Adds a project code prefix to new tasks added in Asana using a service deployed to [Vercel](https://vercel.com).

![Project Code Prefix Example](./example.gif)

e.g. `[PRJ-#] Task Name`

## Deployment

### Prerequisites

Install package dependencies

```sh
yarn
```

### Deploy Application

```sh
now --prod
```

### Add Environment Variables

Rename the `.env.example` file to `.env` and update with the required values.

```
ASANA_ACCESS_TOKEN=<Asana Personal Access Token>
ASANA_PROJECT_ID=<Asana Project ID>
ASANA_PROJECT_PREFIX=<Project Task Prefix>
```

Add the same [environment variable values](https://vercel.com/blog/environment-variables-ui) to the Vercel project.

```sh
now env add ASANA_ACCESS_TOKEN production
# Add ASANA_ACCESS_TOKEN value
```

```sh
now env add ASANA_PROJECT_ID production
# Add ASANA_PROJECT_ID value
```

```sh
now env add ASANA_PROJECT_PREFIX production
# Add ASANA_PROJECT_PREFIX value
```

### Register Hook

Execute the Asana webhook registration script on the deployed production URL.

```sh
yarn run register --url https://<PROJECT_URL>.now.sh/api/asana
```

### Additional Configuration

#### Environment Variables

`ASANA_WORKSPACE_ID` Enables the retrieval and deletion of existing webhooks registered with the workspace. [*Optional*]

`WATCH_CHANGES` Enables prefixes to be added to tasks that already exist when an update occurs to any field within the task. (`true`/`false`) [Default = `false`] [*Optional*]

## Development

Start the development server using the Vercel CLI.

```sh
now dev
```

Forward the local port to the outside using `ngrok`.

```sh
ngrok http 3000
```

Register the `ngrok` tunnel with the Asana webhook functionality.

```sh
yarn run register --url https://<NGROK_URL>.ngrok.io/api/asana
```

## Operations

*Note: Requires the  `ASANA_WORKSPACE_ID` environment variable.*

### Get List of Existing Webhooks

```
yarn run get
```

### Delete Webhook by Id

```
yarn run delete --webhookId 1178960809589035
```

## FAQ

**When registering a webhook I am receiving a `Error: Forbidden` message.**

If you have already registered the webhook once before, try deleting it and re-registering with the `yarn run register` command.
