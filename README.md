# Secure Pipeline Demo

I'm learning DevSecOps and wanted to understand CI/CD pipeline security by building it myself instead of only reading about it. This repo is my practice project.

The app is tiny on purpose: two functions and two tests. The app doesn't matter. What matters is the pipeline around it and how I tried to break it.

## What's in the repo

- `app.js`: two small functions (`add` and `greet`)
- `app.test.js`: two tests for those functions
- `package.json`: tells npm how to run the tests
- `.gitignore`: keeps `node_modules` and `.env` out of Git
- `.github/workflows/ci.yml`: my pipeline
- `config.js`: a file with fake secrets that I used to test the scanner

## How it went

### 1. Building the app
I wrote the app and tests on my laptop and ran `npm test`. Both tests passed. Then I committed and pushed to GitHub.

My first push failed because GitHub doesn't accept account passwords in the terminal anymore. I installed the GitHub CLI, logged in with `gh auth login` through the browser, and the push worked.

### 2. My first pipeline
I created `.github/workflows/ci.yml` so GitHub runs my tests automatically on every push and pull request. It checks out the code, sets up Node, and runs `npm test`.

I also set `permissions: contents: read`, so the pipeline can only read my repo. I did this because of least privilege: if something ever hijacked the pipeline, it couldn't change anything.

GitHub showed a warning about Node 20 being deprecated for the checkout and setup-node actions. It was only a warning, but it taught me that the actions in a pipeline are other people's code and need to be kept up to date.

### 3. Adding a secrets scanner
A pipeline that only runs tests tells you if the code works, not if it's safe. So I added Gitleaks, which looks for passwords and keys in the code.

I set `fetch-depth: 0` so it scans the whole commit history and not just the latest commit. This is because Git never forgets: a secret you delete in a later commit is still in the old ones.

### 4. Trying to break it
I committed fake secrets (never real ones) to see what would happen.

- **GitHub stopped one before it even arrived.** The push was blocked by GitHub's built-in push protection. It recognizes secrets that look like real keys from known services.
- **My first generic fake secret got through Gitleaks.** The pipeline said "no leaks detected". The string wasn't random enough, so the scanner skipped it.
- **A more realistic fake secret failed the pipeline.** With names like `secret_key` and `api_token` and a random-looking value, Gitleaks turned the step red and showed the file, the line, and the rule that matched.

### CodeQL finds two flaws

I pushed deliberately unsafe code. The pipeline job was green, but the Security tab shows two alerts.

![CodeQL alerts open] https://github.com/Ihab133/secure-pipeline-demo/blob/012a8543102b5c9127a09cbaaaed115ef935deaa/Screenshot%202026-10-25%20at%2015.06.00.png

After replacing the dangerous calls and validating input, the alerts closed.

![CodeQL alerts closed] https://github.com/Ihab133/secure-pipeline-demo/blob/3a6ade6253a710ef7790aa1f6f6cc28599b9b2d8/Screenshot%202026-10-25%20at%2015.06.11.png

### 7. Making the gates actually block things
I noticed a problem: by the time the scans finished, the unsafe code was **already on `main`**. The scanners only reported. They didn't stop anything.

So I set up a **branch protection ruleset** on `main`:
- No direct pushes, changes must go through a pull request.
- Required checks must pass before merging.
- No force pushes and no deleting `main`.

Then I tested it. I tried to push straight to `main` and GitHub rejected it with a rule violation message.

After that I did it the right way: created a branch, pushed it, opened a pull request, waited for the checks, and merged. Now the scanners are real gates.

## What I learned so far

- Push protection and Gitleaks catch different things, so having both is better than one.
- Scanners can miss secrets. A weak or non-random secret may pass.
- Deleting a secret from the code doesn't remove it from Git history. A real leaked secret has to be rotated.
- The best fix is to keep secrets out of code entirely and use environment variables or GitHub Secrets.
- Pipelines need least privilege too.

## What's next

- [ ] Add custom Gitleaks rules for weaker secrets
- [ ] Add CodeQL to scan the code itself
- [ ] Add dependency scanning (npm audit and Dependabot)
- [ ] Turn on branch protection so `main` needs passing checks
- [ ] Add dev and prod environments with manual approval
- [ ] Pin third-party actions to a commit SHA
