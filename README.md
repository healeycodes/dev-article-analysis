DEV Article Analysis
=================

A website that graphs textual statistics from a [DEV](https://dev.to) user's articles (readability, complexity, grade level, semantic analysis) over time. The data is displayed in interactive charts.

- Flesch–Kincaid grade level
- Flesch reading ease
- Sentiment analysis

<br>

### Install

`npm i`

<br>

### Setup

Setup the application port, and DEV API key ([https://dev.to/settings/account](https://dev.to/settings/account))

**Linux/macOS**
```
export PORT=3000
export DEV_KEY=abc123
```

**Command Prompt**
```
set PORT=3000
set DEV_KEY=abc123
```

**PowerShell**
```
$env:PORT = "3000"
$env:DEV_KEY = "abc123"
```

<br>

### Run

`npm run start`

<br>

### License

MIT.