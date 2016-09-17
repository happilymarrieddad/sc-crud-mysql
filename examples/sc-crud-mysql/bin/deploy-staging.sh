#!/bin/bash

set -o errexit # Exit on error

git stash save 'Before Deploy'
git checkout deploy
git merge staging --no-edit
npm run build
if $(git commit -am Deploy);
	echo 'Changes committed'
fi
git push origin deploy
git checkout staging
git stash pop