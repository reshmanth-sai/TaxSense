#!/bin/bash

git filter-repo --force --commit-callback '
commit.message = commit.message.replace(
b"\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>",
b""
)
'
