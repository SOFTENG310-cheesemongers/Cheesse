# Cheesse

Cheesse is a simple yet fully functional chess game built for the **SOFTENG 310** project based graphicaly on CHEESE!!!
It follows the official rules of chess and allows:  
- **Single-player mode** against bots of varying difficulty *(planned)*  
- A **web-hosted user interface** with interactive visuals  

---

## What does this project do?  
Cheesse provides a fully interactive chess experience with a graphical web interface based on cheese. Players can enjoy classic chess matches either locally against friends or against computer-controlled opponents (Plan for the future). The game enforces all the rules of chess, including special moves like castling, en passant, and pawn promotion.  

---

## Why is this project useful?  
- A fun and educational way to learn and practice chess.  
- Helps beginners understand legal moves and chess strategies.  
- Provides a structured codebase for learning about **game logic, AI, and front-end web development**.  

---

## Getting Started  

### Production

If you have docker installed (see <https://docs.docker.com/get-started/get-docker/> for installation instructions), you can use the docker container built from this repository to streamline installation for production environments.

#### Prerequisites

For this you just need a up-to-date version of docker

#### Installation

Start by cloning the repository (`git clone https://github.com/SOFTENG310-cheesemongers/Cheesse`), then `cd` into the directory (`cd Cheesse`), then you can run the container by running `docker compose up`.


### Development

#### Prerequisites  
Make sure you have the following installed on your system:  
- **Node.js** (v16 or later)  
- **npm** (comes with Node.js)
- If you don't have: node.js go [here](https://nodejs.org/en/download) to get it.

#### Installation  
Make sure to run the below code after forking and cloning the repository

```bash
cd frontend
npm install
```

#### Running the Project
Start the development server:
```bash
npm start
```
A link should open automatically on your browser. 
If it doesn't go to: [here](http://localhost:3000/)

#### Testing
Run automated tests with:
```bash
npm test
```

## Feature Roadmap  

| Feature              | Description | Release |
|----------------------|-------------|---------|
| **Chessboard UI**    | Basic GUI with chessboard and piece graphics | A1 |
| **Game logic**       | Implements official chess rules and piece movement | A1 |
| **Legal move enforcement** | Only legal moves are allowed | A1 |
| **Turn-based system**| Alternating turns between players | A1 |
| **Capturing & scoring** | Capture pieces and calculate scores | A2 (to do)|
| **Check & checkmate detection** | Detects check and checkmate states | A2 (to do) |
| **Special rules**    | Castling, en passant, pawn promotion | A2 (to do) |
| **Move history**     | Tracks moves with option to restart game | A1 |
| **Game end detection** | Handles checkmate, stalemate, resignation | A2 (to do) |
| **Local PvP gameplay** | Two-player mode on same machine | A1 |
| **Single-player with AI** | Play against bots of varying difficulty | A2 (stretch goal) |
| **Enhanced visuals** | Improved graphics and animations | A2 (planned) |
| **Online multiplayer** | Play against others online | A2 (stretch goal) |

---

### A1 Release (Complete)  
- Core chess game logic  
- Local two-player mode  
- Basic graphical user interface  

### A2 Release (Planned)  
- Complete game endings and special rules
- Single-player gameplay against AI (Varying difficulty: Easy, Medium, Hard)
- Enhanced animations and visuals  
- Potential online multiplayer (stretch goal)  

---

## Acknowledgements
Major Contributers for this project:  
- David
- Macy
- May
- Nathan
- Taewon
- Yash

## Getting Help
If you need help installing or using the library, please check [React Setup](https://react.dev/learn/setup)

If you've instead found a bug in the library or would like new features added, please refer to our [Contributing Guidelines](CONTRIBUTING.md)
