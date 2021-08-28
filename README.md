# This is a microservice implementation of ticketing application

## Note: the whole workflow is in TypeScript

## Some features are ->

- ####  [Async communication](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/communication-in-microservice-architecture) no inter service dependence and [JWT](https://jwt.io/) as auth mechanism 

- ####  Events driven architecture using [Nats-Streaming](https://docs.nats.io/nats-streaming-concepts/intro#:~:text=NATS%20Streaming%20is%20a%20data,in%20the%20Go%20programming%20language.&text=NATS%20Streaming%20embeds%2C%20extends%2C%20and,under%20the%20Apache%2D2.0%20license.) with atleast once guarantee

- #### Kubernetes workflow with [skaffold](https://skaffold.dev/) to make life easy

- #### Mongoose as database with database for each resource and optimistic concurrency control with some nitty-gritty features of mongoose 

- #### Isolated test cases for each service covering every aspect of service like database model, event flow and api routes

- #### Highly decoupled and modular implementation of services

- #### Common library for code-reuse

- #### Language independent app flow for most part

- #### Server-Side-Rendering with NextJS which also covers proxy-ing requests to backend `(which is rather complex when using getInitialProps which is called on frontend and serverless functions depending upon state)` 

- #### Summary of nitty-gritty details included per service basis as markdown
