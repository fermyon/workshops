# Local dev setup

- [Local dev setup](#local-dev-setup)
  - [Make file with Docker compose](#make-file-with-docker-compose)
    - [Docker Compose](#docker-compose)
    - [Makefile](#makefile)
  - [.NET Aspire](#net-aspire)
    - [Create a new Aspire project](#create-a-new-aspire-project)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)

It's hard to get a nice experience for building application consisting of multiple "thing". Creating a local development environments, where you need to run a container, two services, and maybe a cloud service, is hard to get right. Tools like Make or Just are popular to create setups to help with the "run, evaluate, debug, change"-loop, and still get meaningful diagnostics about what's happening across those services, containers, and cloud services you are running.

In this section, we'll give a few different options to create a good local dev experience, for a scenario, where we're using two Spin components and a Redis container for our setup. Feel free to choose your own adventure for this section:

- [Make file with Docker compose](#make-file-with-docker-compose)
- [.NET Aspire](#net-aspire)

## Make file with Docker compose

We want to run the following as part of our application:
1. A Spin application storing data in a KeyValue store
2. A Redis container for our KeyValue store
3. [Jaeger](https://www.jaegertracing.io) to pick up distributed tracing across the three tiers in our application

### Docker Compose

We can use [Docker Compose](https://docs.docker.com/compose/) to define the two containers we need to run: Redis and Jaeger.

```yaml
services:
  redis:
    image: redis
    ports:
      - "6379:6379"

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "4317:4317"
      - "4318:4318"
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

### Makefile

[Make](https://www.gnu.org/software/make/) is very useful to store multiple operations we want to provide while developing locally, e.g., build-all, start-redis, start-all, etc. In this case, we'll just create two operations: `start-all` and `stop-all`.

```makefile
.PHONY: *

# Build the Spin application
build:
	spin build

# Stop all containers
stop_all:
	docker compose down

# Start all containers and Spin w/ runtime-config and OTEL enabled
start_all:
	docker compose up --detach
	OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 spin up --runtime-config-file runtime-config.toml
```

> ***Note**
>  A Makefile is very particular about using tabs and not spaces to inline the commands.

You can now run the following command as part of your setup:

```bash
# Build the Spin application
make build

# Start containers and Spin
make start_all

# Stop all running containers
make stop_all
```

To see the traces collected by Jaeger, use a browser and navigate to `http://localhost:16686`.

## .NET Aspire

Microsoft has built a great tool for setting up your local development environment - [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview). There is a lot Aspire can do with containers, Visual Studio projects, and executables. Aspire also provides service discovery, injecting configuration, and a nice local developer portal, with tracing and logging. In this scenario, we'll use .NET Aspire to describe the local development setup.

### Create a new Aspire project

Start by getting the [required components to run .NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/setup-tooling).

Once those are installed, let's go ahead and create a project. In the following, we'll use the CLI for this.

```bash
$ dotnet new aspire --output Aspire
```

Let's add the NuGet packages to support running Redis and Spin with Aspire.

```bash
$ cd Aspire/Aspire.AppHost/

$ dotnet add package Aspire.StackExchange.Redis

$ dotnet add package Fermyon.Aspire.Spin
```

As Aspire provides Open Telemetry collection and search out-of-the-box, we don't need to run e.g., Jaeger for that.

Now let's head over to the `Program.cs` file and build the system:

```cs
// The standard builder
var builder = DistributedApplication.CreateBuilder(args);

// Let's add a Redis instance with Open Telemetry
var redis = builder.AddRedis("redis").WithOtlpExporter();

// Creating a Spin Runtime configuration, configuring the default store to use Redis
var rtc = SpinRuntimeConfigurationBuilder.Create("myruntimeconfig.toml")
    .WithRedisKeyValueStore("default", redis);

// Setting up the Spin application on port 3000, attaching the runtime configuration, and Open Telemetry
builder.AddSpinApp("my-spin-app", "../../", 3000)
    .WithRuntimeConfig(rtc)
    .WithOtlpExporter();

// Build and run it!
builder.Build().Run();
```

To start the Aspire project, you may have to disable https (at least on MacOS). The below command will run the project using http:

```bash
$ ASPIRE_ALLOW_UNSECURED_TRANSPORT=true dotnet run --project Aspire.AppHost/Aspire.AppHost.csproj --launch-profile http
...
Login to the dashboard at http://localhost:15123/login?t=e65a63f12ddcec65a754b386f5f69d8d
...
```

Now send a few requests to your Spin application, and head over to the Aspire portal to check services, logs, and traces.

That's it~ You've now seen .NET Aspire in action, and can start adding on to your application with other services and apps.

## Learning Summary

In this section you learned how to:

- Use Docker Compose and Make to setup routines for running your Spin WebAssembly application side-by-side with containers
- Use .NET Aspire for running your Spin WebAssembly application side-by-side with containers

## Navigation

- Go back to [2. Using Key Value stores with Spin](./02-key-value-store.md) if you still have questions on previous section
- Otherwise, proceed to [4. Deploy your Spin applications to Kubernetes ans SpinKube](./04-kubernetes-and-spinkube.md).

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
