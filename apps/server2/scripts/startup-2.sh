#!/bin/bash

alembic upgrade head
./dist/main
