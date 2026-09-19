# Contest submission pack

## Complete these details yourself

- Game title: Ganesha's Festival Journey
- Live game: https://ganeshas-festival-journey.jayanthatmakuri198.chatgpt.site
- Team name: [fill in]
- Members and actual contributions: [fill in]
- Student IDs: [fill in privately in the submission form]
- Campus: [fill in]
- Team lead/contact: [fill in]
- Source: attach this package or link to a repository you control
- Tools: HTML5, CSS, JavaScript, Web Audio, AI coding assistance and OpenAI-generated artwork
- Development/testing: Vite, Node.js, jsdom, Prettier

Do not include student IDs or contact details in the public game unnecessarily.
Confirm organizer permission for AI tools and help from outside the registered team.
The rules list 20 September 2026, 5:00 PM as the deadline without specifying timezone.

## How to play (submission note)

Choose Standard or Expert and complete five rounds in each of five festival
trials: memory, maths, hidden-object hunt, sequence recall and pattern logic.
Use mouse/touch, or Tab and Enter/Space. Number keys select answer pads. Escape
pauses. Earn modaks, construct five festival landmarks and upgrade them. Landmarks
unlock practice abilities; these never apply to challenge scores. Finish the
trials and build each landmark to unlock the Grand Festival. Results show score,
accuracy, time, retries and combo. Play again to improve your personal best.

## Suggested 2-minute demo recording

This is a recording plan, not a supplied or fabricated video. Record the actual
working game after device checks. If editing clips from a full run, keep the
sequence honest and mark accelerated or skipped footage.

- 00:00–00:12: Title and goal. Show the game opening from its public link.
- 00:12–00:32: Start a round; show recall, a correct answer and the modak reward.
- 00:32–00:52: Short clips of maths, hunt, sequence and pattern from the same run.
- 00:52–01:07: Show pause/resume preserving the puzzle and a retry penalty.
- 01:07–01:30: Buy a landmark, move it and upgrade it. Explain its practice ability.
- 01:30–01:45: Show the completed run's accuracy/time/score and separate difficulties.
- 01:45–01:55: Show the unlocked Grand Festival and Play Again.
- 01:55–02:00: Name the tools used and disclose AI assistance.

## Code walkthrough talking points

1. core.js generates puzzles and enforces game rules independently of the UI.
2. game.js renders screens, handles inputs, audio and saves.
3. A state machine separates previews, answering, pause, results and completion.
4. settle pays each round once; modaks persist but each challenge score starts at zero.
5. Fixed circuit seeds provide repeatable challenges; practice puzzles vary.
6. No passwords, payments, unnecessary player details or automated score submissions.
7. localStorage records are local and editable, so not trusted online leaderboard data.

## Sources

Contest rules: https://niat-web.github.io/Ganesh-chaturthi-game-design-contest/
Registration link listed by the contest: https://forms.ccbp.in/game-design-contest
