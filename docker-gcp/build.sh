#!/usr/bin/env bash

docker build -t evdash:1.0 --build-arg build=prod -f Dockerfile .
