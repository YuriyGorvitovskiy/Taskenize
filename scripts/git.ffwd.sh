#!/bin/sh

# Adopted from http://stackoverflow.com/questions/4577874/git-automatically-fast-forward-all-tracking-branches-on-pull
# Shell script that fast-forwards all branches that have their upstream branch set to the matching origin/ branch without doing any checkouts
# it doesn't change your current branch at any time, no need to deal with working copy changes and time lost checking out
# it only does fast-forwards, branches that cannot be fast-forwarded will show an error message and will be skipped
# Make sure all your branches' upstream branches are set correctly by running git branch -vv. Set the upstream branch with git branch -u origin/yourbanchname

echo Fetching branches and tags. Prune tracking branches no longer present on remote.
git fetch --prune --tags origin

curbranch=$(git rev-parse --abbrev-ref HEAD)

for branch in $(git for-each-ref refs/heads --format="%(refname:short)"); do
        upbranch=$(git config --get branch.$branch.merge | sed 's:refs/heads/::');
        if [ "$branch" = "$upbranch" ]; then
                if [ "$branch" = "$curbranch" ]; then
                        echo Fast forwarding current branch $curbranch
                        git merge --ff-only origin/$upbranch
                else
                        echo Fast forwarding $branch with origin/$upbranch
                        git fetch . origin/$upbranch:$branch
                fi
        fi
done;
