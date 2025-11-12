# Git Workflow Guide for Cursor

This guide explains how to track changes, manage your codebase, and collaborate effectively using Git with Cursor.

## 📋 Table of Contents

1. [Understanding Git Basics](#understanding-git-basics)
2. [Your Current Git Status](#your-current-git-status)
3. [Tracking Changes in Cursor](#tracking-changes-in-cursor)
4. [Git Workflow for Development](#git-workflow-for-development)
5. [Branching Strategy](#branching-strategy)
6. [Committing Best Practices](#committing-best-practices)
7. [Viewing Change History](#viewing-change-history)
8. [Undoing Changes](#undoing-changes)
9. [Collaboration with Git](#collaboration-with-git)
10. [Cursor-Specific Features](#cursor-specific-features)

---

## 🎯 Understanding Git Basics

Git tracks changes to your codebase, allowing you to:
- **See what changed** and when
- **Revert mistakes** to previous working states
- **Collaborate** with multiple developers
- **Branch** to work on features independently
- **Deploy** with confidence knowing the exact code version

### Key Concepts

- **Repository (Repo):** Your project's codebase with full history
- **Commit:** A snapshot of your code at a point in time
- **Branch:** An independent line of development
- **Staging Area:** Changes marked to be included in next commit
- **Remote:** Server hosting your repo (GitHub, GitLab, etc.)

---

## 📍 Your Current Git Status

Your project is already a Git repository! Check the status anytime:

```bash
git status
```

This shows:
- **Current branch** (e.g., `cursor/analyze-and-provide-feedback...`)
- **Modified files** (red = unstaged, green = staged)
- **Untracked files** (new files not yet in git)

### Check Your Branch

```bash
git branch
```

You're currently on a feature branch. The main/master branch typically contains production code.

### View Recent Changes

```bash
git log --oneline -10
```

Shows the last 10 commits with messages and authors.

---

## 👁️ Tracking Changes in Cursor

Cursor has excellent built-in Git support!

### 1. **Visual Git Indicators**

In Cursor's file explorer, you'll see colored indicators:
- **Green M**: Modified file (already tracked)
- **Green U**: Untracked file (new file)
- **Green A**: Added file (staged for commit)
- **Red D**: Deleted file
- **Yellow R**: Renamed file

### 2. **Source Control Panel**

Click the Source Control icon in the left sidebar (or press `Cmd/Ctrl + Shift + G`):

- View all changed files
- See diffs (what changed)
- Stage/unstage files
- Write commit messages
- Push/pull from remote

### 3. **Inline Diff View**

Open any modified file in Cursor:
- Changed lines are highlighted
- Added lines show in green
- Deleted lines show in red
- Click the gutter icons to see previous versions

### 4. **Compare Changes**

Right-click any modified file → "Open Changes" to see:
- Side-by-side comparison
- Before (left) and After (right)
- Exact lines changed

---

## 🔄 Git Workflow for Development

### Daily Workflow

```bash
# 1. Start your day - get latest changes
git pull origin main

# 2. Create a feature branch
git checkout -b feature/add-stripe-integration

# 3. Make your changes in Cursor
# ... edit files ...

# 4. Check what changed
git status
git diff

# 5. Stage your changes
git add .
# Or stage specific files:
git add server/routes.ts client/src/pages/billing.tsx

# 6. Commit with a descriptive message
git commit -m "Add Stripe payment integration

- Installed stripe package
- Created checkout flow
- Added webhook handler for subscription events
- Updated trial expiration logic"

# 7. Push to remote
git push origin feature/add-stripe-integration

# 8. Create pull request on GitHub/GitLab
# (via web interface)
```

### After Cursor Makes Changes

When Cursor AI modifies files:

```bash
# 1. Review what changed
git diff

# 2. Review each file's changes
git diff server/routes.ts

# 3. If changes look good, stage and commit
git add .
git commit -m "Implement persistent session storage

- Migrated from in-memory to database sessions
- Added session middleware with connect-pg-simple  
- Updated client to use cookie-based auth
- Removed localStorage token handling"

# 4. Push changes
git push
```

---

## 🌿 Branching Strategy

### Branch Types

#### 1. **Main/Master Branch**
```bash
git checkout main
```
- Production-ready code
- Always deployable
- Protected (no direct commits)

#### 2. **Feature Branches**
```bash
git checkout -b feature/template-system
```
- New features or enhancements
- Naming: `feature/description`
- Created from `main`

#### 3. **Bugfix Branches**
```bash
git checkout -b fix/session-expiration-bug
```
- Bug fixes
- Naming: `fix/description`
- Created from `main` or `develop`

#### 4. **Hotfix Branches**
```bash
git checkout -b hotfix/critical-security-patch
```
- Urgent production fixes
- Merged directly to main
- Also merged back to develop

### Working with Branches

```bash
# Create and switch to new branch
git checkout -b feature/analytics-dashboard

# List all branches
git branch -a

# Switch to existing branch
git checkout main

# Delete branch (after merging)
git branch -d feature/analytics-dashboard

# Force delete (if not merged)
git branch -D feature/analytics-dashboard
```

---

## ✍️ Committing Best Practices

### Good Commit Messages

**Format:**
```
Short summary (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).
Explain what and why, not how.

- Use bullet points for multiple changes
- Reference issue numbers if applicable (Fixes #123)
- Keep each commit focused on one thing
```

**Examples:**

✅ **Good:**
```bash
git commit -m "Add Stripe subscription checkout flow

- Created CheckoutButton component
- Implemented server-side checkout session API
- Added success/cancel redirect pages  
- Updated trial expiration to check subscription status

This allows users to upgrade from trial to paid subscription."
```

❌ **Bad:**
```bash
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "asdfasdf"
```

### Commit Frequency

**Commit often, but meaningfully:**

✅ **Good timing:**
- After completing a feature
- After fixing a bug
- Before switching tasks
- At the end of the day
- After successful tests

❌ **Too frequent:**
- After every tiny change
- Mid-refactoring
- With broken code

### What to Commit

✅ **Always commit:**
- Source code
- Configuration files
- Documentation
- Tests
- Database migrations

❌ **Never commit:**
- `.env` files (secrets!)
- `node_modules/`
- Build outputs (`dist/`)
- IDE-specific files
- Log files
- Credentials or API keys

*These are already in `.gitignore`*

---

## 📜 Viewing Change History

### See All Commits

```bash
# Simple list
git log --oneline

# Detailed view
git log

# Pretty view with graph
git log --graph --oneline --all --decorate

# Last 10 commits
git log -10

# Commits by specific author
git log --author="Your Name"

# Commits in date range
git log --since="2 weeks ago"
```

### See What Changed in a Commit

```bash
# View specific commit
git show <commit-hash>

# Example:
git show a1b2c3d4

# See files changed
git show --name-only a1b2c3d4
```

### Compare Branches

```bash
# See commits in feature branch not in main
git log main..feature/your-branch

# See actual code differences
git diff main..feature/your-branch
```

### Search Commit History

```bash
# Find commits that mention "session"
git log --grep="session"

# Find commits that changed specific file
git log -- server/routes.ts

# Find commits that added/removed specific text
git log -S "SESSION_SECRET"
```

---

## ⏪ Undoing Changes

### Before Committing

```bash
# Discard changes to specific file (DESTRUCTIVE!)
git checkout -- server/routes.ts

# Discard all changes (DESTRUCTIVE!)
git checkout -- .

# Unstage file (keep changes, remove from staging)
git reset HEAD server/routes.ts

# Unstage everything
git reset HEAD
```

### After Committing

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - DESTRUCTIVE!
git reset --hard HEAD~1

# Create new commit that undoes previous commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>
```

### Emergency: "I Messed Up Everything!"

```bash
# See what you can recover
git reflog

# Go back to previous state
git reset --hard HEAD@{1}

# Or specific commit
git reset --hard <commit-hash>
```

**⚠️ Warning:** `git reset --hard` is DESTRUCTIVE. Use with caution!

---

## 👥 Collaboration with Git

### Setting Up Remote

```bash
# View current remotes
git remote -v

# Add remote (if not already added)
git remote add origin https://github.com/username/dealerdelight.git

# Change remote URL
git remote set-url origin https://github.com/username/dealerdelight.git
```

### Pulling Changes

```bash
# Get latest changes from remote
git pull origin main

# Pull and rebase (cleaner history)
git pull --rebase origin main
```

### Pushing Changes

```bash
# Push current branch
git push

# Push new branch (first time)
git push -u origin feature/your-branch

# Force push (use carefully!)
git push --force-with-lease
```

### Handling Merge Conflicts

When pulling changes conflicts with your local work:

```bash
# 1. Pull changes
git pull origin main
# Conflict detected!

# 2. Open conflicted files in Cursor
# You'll see conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> origin/main

# 3. Edit file to resolve conflict
# Remove markers, keep desired code

# 4. Mark as resolved
git add conflicted-file.ts

# 5. Complete merge
git commit

# 6. Push resolved changes
git push
```

**Cursor Tip:** Cursor has built-in conflict resolution UI!

---

## 🎨 Cursor-Specific Features

### 1. **Git Lens Integration**

Hover over any line of code to see:
- Who wrote it
- When it was written
- Commit message
- Link to full commit

### 2. **Quick Git Commands**

Open Command Palette (`Cmd/Ctrl + Shift + P`):
- Type "Git" to see all available commands
- Quick access to commit, push, pull, branch, etc.

### 3. **Stage Partial Changes**

In the Source Control panel:
- Click on a file
- In the diff view, click "+" next to specific chunks
- Stage only the changes you want

### 4. **Commit from Cursor**

Source Control panel → Type message → `Cmd/Ctrl + Enter` to commit

### 5. **Branch Visualization**

Install "Git Graph" extension in Cursor for visual branch history.

### 6. **Compare with Branch**

Right-click file → "Compare with Branch..." → Select branch

---

## 🚀 Advanced Workflows

### Keeping Feature Branch Updated

```bash
# On your feature branch
git checkout feature/your-branch

# Get latest main
git fetch origin main

# Merge main into your branch
git merge origin/main

# Or rebase (cleaner but rewrites history)
git rebase origin/main
```

### Squashing Commits

Before merging to main, combine multiple commits:

```bash
# Combine last 3 commits
git rebase -i HEAD~3

# In editor, change "pick" to "squash" for commits to combine
# Save and edit commit message
```

### Cherry-Picking

Apply specific commit from another branch:

```bash
# On target branch
git cherry-pick <commit-hash>
```

### Stashing Changes

Temporarily save uncommitted work:

```bash
# Stash current changes
git stash

# Do other work...
git checkout main
git pull

# Return to branch
git checkout feature/your-branch

# Restore stashed changes
git stash pop

# List stashes
git stash list

# Apply specific stash
git stash apply stash@{0}
```

---

## 📊 Monitoring Your Project

### Statistics

```bash
# Count commits
git rev-list --count HEAD

# See contributors
git shortlog -sn

# See most changed files
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

### File History

```bash
# See all changes to a file
git log -p -- server/routes.ts

# See who changed each line (blame)
git blame server/routes.ts
```

---

## ✅ Daily Git Checklist

### Starting Work
- [ ] `git pull origin main` - Get latest changes
- [ ] `git checkout -b feature/your-task` - Create feature branch
- [ ] Review what's in `.gitignore`

### During Work
- [ ] `git status` - Check what changed
- [ ] `git diff` - Review changes before committing
- [ ] Make focused, logical commits
- [ ] Write clear commit messages

### Ending Work
- [ ] `git status` - Ensure all work is committed
- [ ] `git push` - Backup work to remote
- [ ] Create pull request if feature is complete

### Before Deploying
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Branch merged to main
- [ ] Latest main deployed

---

## 🆘 Common Issues & Solutions

### "Your branch is behind..."
```bash
git pull origin main
```

### "Your branch is ahead..."
```bash
git push origin main
```

### "Diverged from remote"
```bash
git pull --rebase origin main
```

### "Untracked files..."
Either commit them or add to `.gitignore`

### "Detached HEAD state"
```bash
git checkout main
```

---

## 📚 Quick Reference

```bash
# Status
git status                    # See what changed
git diff                      # See exact changes
git log --oneline            # See commit history

# Branching  
git branch                    # List branches
git checkout -b new-branch   # Create & switch branch
git checkout main            # Switch to main

# Staging & Committing
git add .                    # Stage all changes
git add file.ts              # Stage specific file
git commit -m "message"      # Commit staged changes

# Syncing
git pull                     # Get remote changes
git push                     # Send local changes
git push -u origin branch    # Push new branch

# Undoing
git reset HEAD file.ts       # Unstage file
git checkout -- file.ts      # Discard changes
git reset --soft HEAD~1      # Undo last commit
```

---

## 🎓 Learning Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Learn Git Branching](https://learngitbranching.js.org/) - Interactive Tutorial
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Fixing Common Mistakes

---

## 💡 Pro Tips

1. **Commit often** - Easy to squash later, hard to split
2. **Pull before push** - Avoid conflicts
3. **Review before committing** - Use `git diff`
4. **Write meaningful messages** - Future you will thank you
5. **Branch for everything** - Keep main clean
6. **Never commit secrets** - Use `.env` and `.gitignore`
7. **Use Cursor's Git UI** - It's excellent!
8. **Learn keyboard shortcuts** - Faster workflow

---

## ✨ Your Changes Are Tracked!

With this guide, you can:
- ✅ See exactly what Cursor changed
- ✅ Revert mistakes easily
- ✅ Collaborate with confidence
- ✅ Deploy with version control
- ✅ Never lose work again

**Happy coding with Git and Cursor!** 🚀
