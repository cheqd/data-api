# Guide to Cosmos SDK Custom Data APIs

## Context

## Architecture

### Rationale for using Cloudflare Workers

Originally, this project was discussed as potentially being deployed using AWS Lambda. However, Lambda has a cold-start problem if the API doesn't receive too much traffic or is only accessed infrequently.

Cloudflare Workers have much faster cold-start times, with relatively cheap pricing.
