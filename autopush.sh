#!/bin/bash

while true
do
  git add .

  git diff --cached --quiet

  if [ $? -ne 0 ]; then
    git commit -m "auto update $(date)"
    git push origin main
  fi

  sleep 20
done
