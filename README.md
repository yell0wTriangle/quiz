# ITQUES quiz

A static, responsive quiz built from the `IT Questions for Quiz` worksheet in `IT Questions (1).xlsx`. It has no database or server-side code.

- Questions randomize when a new browser session starts.
- Answers, topic choices, and the current question survive page refreshes in the same tab through `sessionStorage`.
- **Start fresh** clears that session and creates a new shuffled attempt.
- The light/dark preference is retained locally; dark mode uses a Catppuccin Mocha palette.

## Deploy to Vercel

1. Create a Git repository from this folder and push it to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project**, then import that repository.
3. Leave the framework preset as **Other** and the build command blank.
4. Deploy. Vercel serves `index.html` directly; no environment variables or database are required.

To update the question bank later, replace or edit `IT Questions (1).xlsx`, run `python build_questions.py`, and redeploy the generated `questions.js`.
