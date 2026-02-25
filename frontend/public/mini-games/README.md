# BrightPath Three.js Mini Games

This folder contains lightweight, hackathon-friendly mini games built with Three.js and vanilla JavaScript modules.

## Folder Structure

```text
mini-games/
  index.html
  css/
    styles.css
  js/
    main.js
    core/
      scene.js
      ui.js
    games/
      softwareEngineering.js
      dataAnalytics.js
      cybersecurity.js
      productManager.js
      uxDesigner.js
      cloudEngineer.js
```

## How It Works

- `core/scene.js`: base Three.js setup (scene, camera, renderer, lights, raycaster)
- `core/ui.js`: mission/feedback/score text control
- `games/*.js`: one class per game with a shared shape:
  - `start()` build objects
  - `handleClick()` evaluate player input
  - `update()` animate each frame
  - `dispose()` cleanup
- `main.js`: game switching, click handling, animation loop

## Included Career Roles

- Software Engineering (debugging decisions)
- Data Analytics (trend recognition)
- Cybersecurity (threat detection)
- Product Manager (impact prioritization)
- UX Designer (layout hierarchy)
- Cloud Engineer (service reliability)

## Progression Rules

- Roles unlock in sequence as total score increases.
- Unlock thresholds:
  - 0: Software Engineering
  - 2: Data Analytics
  - 4: Cybersecurity
  - 6: Product Manager
  - 8: UX Designer
  - 10: Cloud Engineer
- Score is cumulative across all mini games and shown in the sidebar.
- Score is persisted in browser `localStorage` and restored after refresh.
- Use the "Reset Progress" button to clear score and relock careers.

## Badge System

- Badges unlock automatically at score milestones and appear in the sidebar.
- Badge thresholds:
  - 2: Debugger
  - 4: Analyst
  - 6: Defender
  - 8: Strategist
  - 10: Designer
  - 12: Cloud Operator
- Badge progress is persisted in `localStorage` and reset with "Reset Progress".
- Optional badge sound can be enabled with the "Enable badge sound" toggle (off by default).
- Sound preference is persisted in `localStorage`.

## Add a New Career Game

1. Create `js/games/newCareer.js` exporting a class with `mission`, `start`, `handleClick`, `update`, `dispose`.
2. Import and register it in `js/main.js` inside the `games` map.
3. Add a button in `index.html` with `data-game="newCareer"`.
