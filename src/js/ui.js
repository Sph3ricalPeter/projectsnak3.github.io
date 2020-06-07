class UI {
  constructor() {
    this.States = {
      MainMenu: 0,
      NickPicker: 1,
      HUD: 2,
      GameOver: 3,
      Hiscores: 4,
      Settings: 5,
    };

    this.state = this.States.MainMenu;

    // fader
    this.fader = new Fader();
    this.fader.fadeBlackToAlpha(1);

    // small screen info
    this.smallScreenInfo = new FullscreenInfo(
      color(0),
      color(255),
      30,
      "screen size is too small"
    );

    this.mainMenu = new MainMenuUI();
    this.nickPicker = new NickPickerUI();
    this.hud = new HUD();
    this.gameOver = new GameOverUI();
    this.hiscores = new HiscoresUI();
    /* this.settings = new SettingsUI();
    this.settings.show(false); */

    this.changeState(this.States.MainMenu);
  }

  update() {
    if (smallScreen) {
      this.disableEverything();
      this.smallScreenInfo.show();
    } else {
      if (this.state == this.States.HUD) {
        this.hud.draw();
      }
    }

    this.fader.draw();
  }

  changeState(state) {
    this.state = state;
    this.showUIByState();
  }

  showUIByState() {
    this.disableEverything();

    switch (this.state) {
      case this.States.MainMenu:
        this.mainMenu.show(true);
        break;
      case this.States.NickPicker:
        this.nickPicker.show(true);
        break;
      case this.States.HUD:
        // controlled in update
        break;
      case this.States.GameOver:
        this.gameOver.show(true);
        break;
      case this.States.Hiscores:
        this.hiscores.show(true);
        break;
    }
  }

  disableEverything() {
    this.mainMenu.show(false);
    this.nickPicker.show(false);
    this.gameOver.show(false);
    this.hiscores.show(false);
    /* this.settings.show(false); */
  }
}

class MainMenuUI {
  constructor() {
    // main menu
    this.mainMenu = document.querySelector("#main-game-menu");

    this.playButton = document.querySelector("#play-button");
    this.modeSelect = document.querySelector("#mode-select");
    this.playButton.addEventListener("click", () => {
      console.log("play " + this.modeSelect.value);
      ui.changeState(ui.States.NickPicker);
      let mode = game.Modes.CLASSIC;
      switch (this.modeSelect.value) {
        case "arcade":
          mode = game.Modes.ARCADE;
          break;
        case "exploration":
          mode = game.Modes.EXPLORATION;
          break;
        default:
          break;
      }
      game.mode = mode;
    });

    this.highscoresButton = document.querySelector("#highscores-button");
    this.highscoresButton.addEventListener("click", () => {
      console.log("highscores");
      ui.changeState(ui.States.Hiscores);
    });

    this.settingsButton = document.querySelector("#settings-button");
    this.settingsButton.addEventListener("click", () => {
      console.log("settings");
    });
  }

  show(show) {
    if (show) {
      this.mainMenu.style.display = "flex";
    } else {
      this.mainMenu.style.display = "none";
    }
  }
}

class NickPickerUI {
  constructor() {
    // nick input
    this.nickInputSection = document.querySelector("#nick-input");

    this.nickInputInitValue = "enter your nickname";
    this.nickInputField = document.querySelector("#nickInputField");
    this.nickInputField.addEventListener("click", () => {
      if (this.nickInputField.value === this.nickInputInitValue) {
        this.nickInputField.value = "";
      }
    });

    this.nickInputField.addEventListener("focusout", () => {
      if (nickInputField.value === "") {
        nickInputField.value = this.nickInputInitValue;
      }
    });

    this.colorPicker = document.querySelector("#player-color-picker");
    this.nicknameSubmit = document.querySelector("#nick-input-submit");
    this.nicknameSubmit.addEventListener("click", () => {
      this.getPlayerInfoFromInput();
      game.restart();
      game.play();
      ui.changeState(ui.States.HUD);
    });

    document
      .querySelector("#nick-input")
      .insertAdjacentElement("afterbegin", this.nickInputField);
  }

  show(show) {
    if (show) {
      this.nickInputSection.style.display = "flex";
    } else {
      this.nickInputSection.style.display = "none";
    }
  }

  getPlayerInfoFromInput() {
    if (
      this.nickInputField.value != "" &&
      this.nickInputField.value != this.nickInputInitValue &&
      this.nickInputField.value.length < 20
    ) {
      score.nickname = this.nickInputField.value;
      game.snakeColor = this.colorPicker.value;

      this.nickInputSection.style.display = "none";
    } else {
      console.error("wrong nickname!");
    }
  }
}

class HUD {
  constructor() {}

  draw() {
    this.showScore();
    this.showNickname();
  }

  showScore() {
    textFont("Acknowledge");
    textSize(75);
    fill(255);
    text(score.current, canvasWidth / 2, 50);
  }

  showNickname() {
    textFont("Acknowledge");

    let x = canvasWidth;
    let y = 35;
    let size = 35;
    let bb = font.textBounds(score.nickname, x, y, size);

    textAlign(CENTER);
    textSize(size);
    text(score.nickname, x - bb.w, y);
    fill(150);
  }
}

class GameOverUI {
  constructor() {
    this.menu = document.querySelector("#game-over");

    this.retryButton = document.querySelector("#retry-button");
    this.retryButton.addEventListener("click", () => {
      ui.changeState(ui.States.HUD);
      game.restart();
    });

    this.backButton = document.querySelector("#back-to-menu-button");
    this.backButton.addEventListener("click", () => {
      ui.changeState(ui.States.MainMenu);
    });

    this.scoreText = document.querySelector("#game-over-score");
  }

  show(show) {
    if (show) {
      this.scoreText.innerHTML =
        "your hiscore: " + score.hiscores[score.nickname];
      this.menu.style.display = "flex";
    } else {
      this.menu.style.display = "none";
    }
  }
}

class HiscoresUI {
  constructor() {
    this.hiscores = document.querySelector("#hiscores");

    this.hiscoresList = document.querySelector("#hiscores-list");

    this.backButton = document.querySelector("#back-button-hiscores");
    this.backButton.addEventListener("click", () => {
      ui.changeState(ui.States.MainMenu);
    });

    this.topN = null;
    this.nShown = 0;
  }

  show(show) {
    if (show) {
      this.update();
      this.hiscores.style.display = "flex";
    } else {
      this.hiscores.style.display = "none";
    }
  }

  update() {
    this.topN = score.getTopN(10);
    this.resize(true);
  }

  resize(force) {
    let n = parseInt(canvasHeight / 150);

    if (this.topN != null && (n != this.nShown || force)) {
      this.nShown = n;
      console.log(`hiscores resize to ${this.nShown}`);

      this.hiscores.getElementsByTagName(
        "h1"
      )[0].innerHTML = `Top ${n} Hiscores`;
      this.hiscoresList.innerHTML =
        "<li class='heading'><p>name</p><p>score</p></li>";

      let i = 0;
      this.topN.forEach((item) => {
        if (i++ >= n) return;

        let li = document.createElement("li");
        let pPlayer = document.createElement("p");
        pPlayer.innerHTML = item[0];
        let pScore = document.createElement("p");
        pScore.innerHTML = item[1];
        li.appendChild(pPlayer);
        li.appendChild(pScore);

        this.hiscoresList.appendChild(li);
      });
    }
  }
}

class FullscreenInfo {
  constructor(bgColor, textColor, textSize, text) {
    this.bgColor = bgColor;
    this.textColor = textColor;
    this.textSize = textSize;
    this.text = text;
  }

  show() {
    background(this.bgColor);
    textFont("Acknowledge");
    textSize(this.textSize);
    fill(this.textColor);
    textAlign(CENTER);
    text(this.text, canvasWidth / 2, canvasHeight / 2);
  }
}

class Fader {
  constructor() {
    this.progress = 0;
    this.length = 1;
    this.speed = 1 / fps;
    this.active = false;
    this.fromColor = color(255);
    this.toColor = color(255, 0);
  }

  fade(length, fromColor, toColor) {
    this.length = length;
    this.fromColor = fromColor;
    this.toColor = toColor;
    this.active = true;
  }

  fadeBlackToAlpha(length) {
    this.fade(length, color(0), color(0, 0));
  }

  fadeWhiteToAlpha(length) {
    this.fade(length, color(255), color(255, 0));
  }

  draw() {
    if (this.active) {
      let color = lerpColor(this.fromColor, this.toColor, this.progress);
      fill(color);
      rect(0, 0, canvasWidth, canvasHeight);

      this.progress += this.speed / this.length;
      if (this.progress >= 1) {
        this.active = false;
        this.progress = 0;
      }
    }
  }
}

class Button {
  constructor(x, y, text, size, func) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.size = size;
    this.color = color(150);
    this.func = func;

    let bb = font.textBounds(
      this.text,
      this.x,
      this.y,
      this.size,
      textAlign(CENTER)
    );

    this.bbx = bb.x;
    this.bby = bb.y;
    this.bbw = bb.w;
    this.bbh = bb.h;

    this.active = true;
  }

  click() {
    if (this.active) {
      if (this.isMouseOver()) {
        this.func();
      }
    }
  }

  hover() {
    if (this.active) {
      if (this.isMouseOver()) {
        this.color = color(255);
      } else {
        this.color = color(150);
      }
    }
  }

  isMouseOver() {
    if (this.active) {
      return (
        this.bbx < mouseX &&
        mouseX < this.bbx + this.bbw &&
        this.bby < mouseY &&
        mouseY < this.bby + this.bbh
      );
    }
  }

  display() {
    if (this.active) {
      textSize(this.size);
      textAlign(CENTER);
      textFont("Acknowledge");
      fill(this.color);
      text(this.text, this.x, this.y);
    }
  }
}