'use strict'

const GAMER = 'GAMER'
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BOX = 'BOX'
const TARGET = 'TARGET'
const GLUE = 'GLUE'
const GOLD = 'GOLD'
const CLOCK = 'CLOCK'

const GAMER_FRONT_IMG = '<img src="img/gamer-front.png" />'
const GAMER_LEFT_IMG = '<img src="img/gamer-left.png" />'
const GAMER_RIGHT_IMG = '<img src="img/gamer-right.png" />'
const GAMER_BACK_IMG = '<img src="img/gamer-back.png" />'
const WALL_IMG = '<img src="img/wall-black.png" />'
const FLOOR_IMG = '<img src="img/floor.png" />'
const BOX_IMG = '<img src="img/box-dark-brown.png" />'
const BOX_ON_TARGET_IMG = '<img src="img/box-brown.png" />'
const TARGET_IMG = '<img src="img/end-point-brown.png" />'
const GLUE_IMG = '<img src="img/glue.png" />'
const CLOCK_IMG = '<img src="img/clock.png" />'
const GOLD_IMG = '<img src="img/gold.png" />'

// LEVEL DATA TAMPLATE
// const gLeveln = [
//     // [0 gamerPos],
//     [],
//     // [1 board dimensions],
//     [],
//     // [2 score],
//     [],
//     // [3 walls],
//     [],
//     // [4 targets],
//     [],
//     // [5 boxes],
//     ]

const gLevel1 = [
    // Gamer Positions [i, j]
    [1, 2],
    // Board dimensions [rows, cols]
    [5, 4],
    // Score
    [100],
    // Walls locations
    [],
    // Targets locations
    [('1-1')],
    // boxes locations
    [('2-1')]
]

const gLevel2 = [
    // Gamer Positions [i, j]
    [3, 1],
    // Board dimensions [rows, cols]
    [6, 7],
    // Score
    [100],
    // Walls locations
    [('2-1'), ('2-2'), ('2-3'), ('3-2')],
    // Targets locations
    [('1-1'), ('3-3'), ('2-5')],
    // boxes locations
    [('1-3'), ('3-4'), ('3-5')]
]

const gLevel3 = [
    // Gamer Positions [i, j]
    [2, 2],
    // Board dimensions [rows, cols]
    [9, 8],
    // Score
    [100],
    // Walls locations
    [('1-1'), ('1-2'), ('1-6'), ('2-6'), ('3-1'), ('3-2'), ('3-6'), ('4-2'), ('4-3'), ('4-6'), ('5-2'), ('5-6')],
    // Targets locations
    [('2-1'), ('4-1'), ('3-5'), ('5-4'), ('8-4'), ('6-3'), ('6-6')],
    // Boxes locations
    [('2-3'), ('3-4'), ('4-4'), ('6-1'), ('6-3'), ('6-4'), ('6-5')]
]

const gLevel4 = [
    // [0 gamerPos],
    [4, 7],
    // [1 board dimensions],
    [10, 14],
    // [2 score],
    [100],
    // [3 walls],
    [('1-5'), ('1-11'), ('1-12'), 
     ('2-5'),
     ('3-5'), ('3-7'), ('3-8'), ('3-9'), ('3-10'),
     ('4-9'), ('4-10'),
     ('5-5'), ('5-7'), ('5-12'),
     ('6-1'), ('6-2'), ('6-3'), ('6-4'), ('6-5'), ('6-7'), ('6-8'),
     ('7-1'), ('7-2'), ('8-1'), ('8-2'), ('8-7')],
    // [4 targets],
    [('1-1'), ('1-2'), ('2-1'), ('2-2'), ('3-1'), ('3-2'), ('4-1'), ('4-2'), ('5-1'), ('5-2')],
    // [5 boxes],
    [('2-7'), ('2-10'), ('3-6'), ('5-10'), ('6-9'), ('6-11'), ('7-4'), ('7-7'), ('7-9'), ('7-11')]
]

const gLevel5 = [
// [0 gamerPos],
[],
// [1 board dimensions],
[],
// [2 score],
[],
// [3 walls],
[],
// [4 targets],
[],
// [5 boxes],
]

var gCurrLevel;
var gLevelNum;
var gBoard;
var gGamerPos;
var gIsGameOn;
var gScore;
var gIsGlued;
var gSteppedOnClock;
var gClockStepsCount;
var gIsGamerGolden;
var gAreElementsOnBoard;

var gGlueGenInterval;
var gGoldGenInterval;
var gClockGenInterval;

var gGlueLocation;
var gGoldLocation;
var gClockLocation;

// TODO:
// 1. create "back" button that resets the last move
//  - how to save data - obajact map {gamer position, box position}
//  - how to treat the intervals
// 2. create local high score 
//  - how?
//  - present the high score (header?)

function onInitGame(num) {
    if(gAreElementsOnBoard) return
    // ADJUSTED TO MULTIPLE LEVELS
    gLevelNum = num
    gCurrLevel = eval('gLevel' + num)

    gGamerPos = { i: gCurrLevel[0][0], j: gCurrLevel[0][1] }

    gBoard = buildBoard((gCurrLevel[1][0]), gCurrLevel[1][1])
    renderBoard(gBoard)

    //Setting game values
    gIsGameOn = true
    gIsGlued = false
    gIsGamerGolden = false
    gSteppedOnClock = false
    gClockStepsCount = 0
    gScore = gCurrLevel[2]

    //Restart locations 
    gClockLocation = null
    gGoldLocation = null
    gGlueLocation = null

    // Set intervals
    gGlueGenInterval = setInterval(generateGlue, 10000)
    gGoldGenInterval = setInterval(generateGold, 10000)
    gClockGenInterval = setInterval(generateClock, 10000)
   
    // Reset score borad
    document.querySelector('.clock-count span').innerHTML = gClockStepsCount
    document.querySelector('.score span').innerHTML = gScore
    document.querySelector('.modal h2').innerHTML = 'Got Stuck? just click for another try - ⬇'
    document.querySelector('.nextlevel').style.display = "none"


}

function onInitNextLevel() {
    onInitGame(gLevelNum)
}

function onInitGameRestart() {
    //level won, and played again
    if (!gIsGameOn) onInitGame(gLevelNum - 1)

    else onInitGame(gLevelNum)
}

// Creates board and sets walls targets boxs and gamer
function buildBoard(rows, cols) {
    // Create the Matrix
    var board = createMat(rows, cols)

    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null }

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL
            }

            // ADJUSTED FOR MULTIPLE LEVELS
            //================================================//

            var searchStr = i + '-' + j
            // Add currlevel walls
            if (gCurrLevel[3].includes(searchStr)) cell.type = WALL
            // Add currlevel targets
            else {
                if (gCurrLevel[4].includes(searchStr)) cell.type = TARGET
                // Add currlevel boxes
                if (gCurrLevel[5].includes(searchStr)) cell.gameElement = BOX
            }

            // Add created cell to The game board
            board[i][j] = cell
        }
    }

    // Add gamer to selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    // console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })
            // Adding cell.type:
            if (currCell.type === FLOOR) {
                cellClass += ' floor'
            } else if (currCell.type === WALL) {
                cellClass += ' wall'
            } else if (currCell.type === TARGET) {
                cellClass += ' target'
            }

            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // Adding floors and walls
            if (currCell.type === WALL) {
                strHTML += WALL_IMG
            } else if (currCell.type === TARGET && currCell.gameElement === BOX) {
                strHTML += BOX_ON_TARGET_IMG
            } else if (currCell.type === TARGET) {
                strHTML += TARGET_IMG
            } else if (currCell.gameElement === BOX) {
                strHTML += BOX_IMG
            }

            // Adding gamer
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_FRONT_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
        // console.log(strHTML)
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}




// SAVING GAME PROGRESS DATA
// var gGameProgress = []



// Move the player to a specific location
function moveTo(i, j) {
    
    if (gIsGlued || !gIsGameOn) return
    
    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    
    // Calculate distance to insure movment to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);
    
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === 1)) {
        
        // Adjust score normal
        if (!gSteppedOnClock) {
            gScore--
            document.querySelector('.score span').innerHTML = gScore
            // Adjust score clock 
        } else {
            gClockStepsCount--
            if (gClockStepsCount === 0) {
                gSteppedOnClock = false
            }
            document.querySelector('.clock-count span').innerHTML = gClockStepsCount
        }



        
//=================================================================================================//

// var positionData =  {}
// gamerPositionI: , gamerPositionJ: , boxPositionI: , boxPositionJ:


//=================================================================================================//



        // If the player push a box - 
        if (targetCell.gameElement === BOX) {
            
            // 1. check if movment is possible
            var nextBoxLocation = getNextBoxCell(i, j)
            var nextBoxCell = gBoard[nextBoxLocation.i][nextBoxLocation.j]
            if ((nextBoxCell.type === WALL) ||
                (nextBoxCell.gameElement === BOX) ||
                (nextBoxCell.gameElement === GLUE) ||
                (nextBoxCell.gameElement === CLOCK) ||
                (nextBoxCell.gameElement === GOLD)) {
                console.log('cant push in that direction')
                gScore++
                //playSound('cant-push')
                return
            }

            // 2. render acoordingly
            console.log('No problem - Pushing!')
            moveBox(nextBoxLocation.i, nextBoxLocation.j)
            // playSound('push')

            // 3. Check victory
            if (checkVictory()) {
                console.log('you won!')
                gameOver()
            }
            // Conditions for glue
        } else if (targetCell.gameElement === GLUE) {
            gIsGlued = true
            gScore -= 5
            document.querySelector('.score span').innerHTML = gScore
            // playSound('glue')

            changeBgc({ i: i, j: j }, "red")


            // Conditions for gold
        } else if (targetCell.gameElement === GOLD) {
            gScore += 100
            document.querySelector('.score span').innerHTML = gScore
            gIsGamerGolden = true

            setTimeout(() => {
                gIsGamerGolden = false
            }, 5000)

            // Conditions for clock
        } else if (targetCell.gameElement === CLOCK) {
            gSteppedOnClock = true
            gClockStepsCount += 10
            document.querySelector('.clock-count span').innerHTML = gClockStepsCount
        }

        // MOVING from current position
        // Model:
        var fromCell = gBoard[gGamerPos.i][gGamerPos.j]
        fromCell.gameElement = null

        // Dom:
        var currPositionImg = (fromCell.type === TARGET) ? TARGET_IMG : null
        renderCell(gGamerPos, currPositionImg)
        // Changing bgc back to gray
        changeBgc({ i: gGamerPos.i, j: gGamerPos.j }, "gray")

        // MOVING to selected position
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

        // DOM:
        var gamerImg = GAMER_FRONT_IMG
        // Conditions for gamer movement
        // if gamer goes left
        // if gamer goes right
        // if gamer goes up
        // if gamer goes down

        // Adding gamer bgc-green while clocked\golden
        if ((!gIsGlued) && (gSteppedOnClock || gIsGamerGolden)) {
            var cellSelector = '.' + getClassName({ i: gGamerPos.i, j: gGamerPos.j })
            var elCell = document.querySelector(cellSelector)
            elCell.style.backgroundColor = "green"
        }

        renderCell(gGamerPos, gamerImg)
    }
}

function onHandleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break;
        case 'ArrowRight':
            moveTo(i, j + 1)
            break;
        case 'ArrowUp':
            moveTo(i - 1, j)
            break;
        case 'ArrowDown':
            moveTo(i + 1, j)
            break;

    }
}

function moveBox(toI, toJ) {
    //Update model:
    gBoard[toI][toJ].gameElement = BOX

    //Update DOM:
    var boxImg = (gBoard[toI][toJ].type === TARGET) ? BOX_ON_TARGET_IMG : BOX_IMG
    renderCell({ i: toI, j: toJ }, boxImg)
}

function getNextBoxCell(i, j) {

    var iDiff = i - gGamerPos.i
    var jDiff = j - gGamerPos.j

    return { i: i + iDiff, j: j + jDiff}
}

function checkVictory() {
    // Multiple level
    // loop target locations
    for (var i = 0; i < gCurrLevel[4].length; i++) {
        // extract locatin.i location.j
        var str = gCurrLevel[4][i]
        var location = str.split('-')
        // check if all target locations contain box
        if (gBoard[location[0]][location[1]].gameElement !== BOX) return false
    }

    return true
}

function getEmptyCell(board) {
    var emptyCellsLocations = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].type === WALL) continue
            if (board[i][j].gameElement === null) {
                emptyCellsLocations.push({ i: i, j: j })

            }
        }
    }
    var rndEmptyCell = emptyCellsLocations[getRandomInt(0, emptyCellsLocations.length)]
    // if (gBoard[rndEmptyCell.i][rndEmptyCell.j].type === TARGET) gIsElementOnTarget = true
    return rndEmptyCell
}

function generateElement(element, IMG) {

    // get empty cell location
    var newLocation = getEmptyCell(gBoard)

    // Update model:
    gBoard[newLocation.i][newLocation.j].gameElement = element

    // Update DOM:
    renderCell(newLocation, IMG)

    // set timer to prevent level change befor intervals are ended.
    gAreElementsOnBoard = true
    setTimeout(() => {
        gAreElementsCleared = false
    }, 5000);

    return newLocation
}

function clearElement(location) {

    //prevent deleting the gamer if he stays on gold\clock
    if (gBoard[location.i][location.j].gameElement === GAMER || 
        gBoard[location.i][location.j].gameElement === BOX) return

    //Update model:
    gBoard[location.i][location.j].gameElement = null

    //Update DOM:
    var locationSearchStr = location.i + '-' + location.j
    //gLevel1[4] contain TARGET location
    var img = (gCurrLevel[4].includes(locationSearchStr)) ? TARGET_IMG : null
    renderCell(location, img)

}

function changeBgc(location, str) {
    // change cell bgc to str
    var cellSelector = '.' + getClassName({ i: location.i, j: location.j })
    var elCell = document.querySelector(cellSelector)
    elCell.style.backgroundColor = str
    // change back to gray
    setTimeout(() => {
        if (str === "red") gIsGlued = false
        var cellSelector = '.' + getClassName({ i: location.i, j: location.j })
        var elCell = document.querySelector(cellSelector)
        elCell.style.backgroundColor = "gray"
    }, 5000)
}

function generateGlue() {
    var location = generateElement(GLUE, GLUE_IMG)
    setTimeout(() => {
        clearElement(location)
        gGlueLocation = null
    }, 5000)
}

function generateClock() {
    var location = generateElement(CLOCK, CLOCK_IMG)
    setTimeout(() => {
        clearElement(location)
        gClockLocation = null
    }, 5000)
}

function generateGold() {
    var location = generateElement(GOLD, GOLD_IMG)
    setTimeout(() => {
        clearElement(location)
        gGoldLocation = null
    }, 5000)
}

function gameOver() {

    gIsGameOn = false
    // Change text above button
    document.querySelector('.modal h2').innerHTML = 'You did it! \n' + 'would you like to beat the current score? ⬇'
    // Reveal next level button
    document.querySelector('.nextlevel').style.display = "block"
    document.querySelector('.nextlevel span').innerHTML = 'want some more?     ➡'

    clearInterval(gClockGenInterval)
    clearInterval(gGoldGenInterval)
    clearInterval(gGlueGenInterval)
    gLevelNum++

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}
