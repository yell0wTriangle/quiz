# ITQUES quiz

A static, responsive quiz with separate PDF and book question banks. The **PDF questions** section is generated from the `IT Questions for Quiz` worksheet in `pdf ques.xlsx`; **Book questions** comes from the `Book Questions` worksheet in `book ques.xlsx`.

- Questions randomize when a new browser session starts and when switching sections.
- Topic filters apply within the selected section.
- Answers, topic choices, section, and current question survive page refreshes in the same tab through `sessionStorage`.
- **Start fresh** clears that session and creates a new shuffled attempt.
- The light/dark preference is retained locally; dark mode uses a Catppuccin Mocha palette.

## Deploy to Vercel

1. Create a Git repository from this folder and push it to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project**, then import that repository.
3. Leave the framework preset as **Other** and the build command blank.
4. Deploy. Vercel serves `index.html` directly; no environment variables or database are required.

To update the question banks, edit `pdf ques.xlsx` or `book ques.xlsx`, run `python build_questions.py`, and redeploy the generated `questions.js`.
