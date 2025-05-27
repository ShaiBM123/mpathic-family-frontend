#!/bin/bash
cd /home/ubuntu/mpathic/frontend/prod/
docker compose down --rmi all
docker compose up -d --build

