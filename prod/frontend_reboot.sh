#!/bin/bash
cd /home/ubuntu/mpathic/mpathic-family-frontend/prod/
docker compose down --rmi all
docker compose up -d --build

