1. Use the current version of Angular
2. Get the issue data from the GitHub GraphQL API.
3. Show the repository's open issues as they were when the site was last deployed. For each issue, show at least its number, its title (linking to the issue on GitHub), its labels, its author, and when it was opened. Include every open issue, even if there are more than 100.
4. If there are no open issues, say so clearly on the page.
5. Deploy with a GitHub Actions workflow that runs:
    * automatically on every push to the default branch, and
    * manually, from the "Run workflow" button in the Actions tab, so the issue list can be refreshed without changing any code.
6. The only credential allowed is the token GitHub Actions gives every workflow run automatically (GITHUB_TOKEN). Don't use personal access tokens or require any repository secrets, and make sure the token never ends up in the deployed site.
7. Don't hardcode anything tied to your account or repository (owner, repository name, URLs or paths). The same code must work in any repository.
8. Add a README that explains how the app works and how to deploy it.How we'll test itWe will do exactly the following, and nothing else:
9. Clone your repository and push it to a new public repository on our own GitHub account.
10. Turn on GitHub Pages: Settings → Pages → Source: GitHub Actions.
11. Run the workflow from the Actions tab, then open the site.
12. Create and close a few issues, run the workflow again, and check that the list has been updated.Every step must work without editing the code or changing any other setting. It's fine if the very first run, the one triggered by our push, fails because Pages isn't turned on yet.Optional extras
* Automated tests.
* After a redeploy, the new list appears on a normal page reload, without a hard refresh.
* A clean UI that also works on a phone.