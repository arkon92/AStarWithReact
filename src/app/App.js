import React, {Component} from 'react';
import Header from './Header.js';
import Board from "./Board.js";
import styles from './css/App.css';

class App extends Component {

    constructor(props) {
        super(props);

        var tmpSquaresPerWidth = 10;

        var tmpBoard = Array.from(new Array(tmpSquaresPerWidth * tmpSquaresPerWidth));

        this.state = {
            squaresPerWidth: tmpSquaresPerWidth,
            boardWidth: 400,
            pathResult: [],
            nextItemIndex: 0,
            timerSet: false,
            squareType: '0',
            board: tmpBoard,
            startPosition: -1,
            endPosition: -1,
            boardUpdateNeeded: true
        };


        this.updateStartPosition = this.updateStartPosition.bind(this);
        this.updateEndPosition = this.updateEndPosition.bind(this);
        this.updateObstaclePosition = this.updateObstaclePosition.bind(this);

        this.selectingStartPosition = this.selectingStartPosition.bind(this);
        this.selectingObstaclePosition = this.selectingObstaclePosition.bind(this);
        this.selectingEndPosition = this.selectingEndPosition.bind(this);

        this.launchAStar = this.launchAStar.bind(this);
        this.handleTimerCreation = this.handleTimerCreation.bind(this);
        this.updateNextItemIndex = this.updateNextItemIndex.bind(this);
        this.gridUpdated = this.gridUpdated.bind(this);

        this.handleSquareNumberChange = this.handleSquareNumberChange.bind(this);
        this.resetApplication = this.resetApplication.bind(this);
    }


    componentDidMount() {
        if (this.props.boardUpdateNeeded) {
            this.setState({boardUpdateNeeded: false});
        }
    }

    updateStartPosition(index) {
        const tmpBoard = this.state.board.slice();
        tmpBoard[index] = 1;
        this.setState({
            startPosition: index,
            board: tmpBoard
        }, () => {
            if (this.state.startPosition !== -1 && this.state.endPosition !== -1) {
                this.selectingObstaclePosition();
            } else {
                this.selectingEndPosition();
            }
        });
    }

    updateEndPosition(index) {
        const tmpBoard = this.state.board.slice();
        tmpBoard[index] = 3;
        this.setState({
            endPosition: index,
            board: tmpBoard
        }, () => {
            if (this.state.startPosition !== -1 && this.state.endPosition !== -1) {
                this.selectingObstaclePosition();
            } else {
                this.selectingStartPosition();
            }
        });
    }

    updateObstaclePosition(index) {
        const tmpBoard = this.state.board.slice();
        tmpBoard[index] = 2;
        this.setState({
            board: tmpBoard
        });
    }

    selectingStartPosition() {
        this.setState(
            {
                squareType: '0'
            });
    }

    selectingObstaclePosition() {
        this.setState(
            {
                squareType: '1'
            });
    }

    selectingEndPosition() {
        this.setState(
            {
                squareType: '2'
            });
    }

    handleTimerCreation() {
        this.setState({
            nextItemIndex: this.state.pathResult.length - 2,
            timerSet: true
        });
    }

    updateNextItemIndex(index) {
        this.setState({
            nextItemIndex: index
        });
    }

    gridUpdated() {
        this.setState({boardUpdateNeeded: false});
    }

    manhattanDistance(x, y) {
        const x0 = Math.floor(x / this.state.squaresPerWidth);
        const x1 = x % this.state.squaresPerWidth;

        const y0 = Math.floor(y / this.state.squaresPerWidth);
        const y1 = y % this.state.squaresPerWidth;

        return Math.abs(x0 - y0) + Math.abs(x1 - y1);
    }

    distance(x, y) {
        const x0 = Math.floor(x / this.state.squaresPerWidth);
        const x1 = x % this.state.squaresPerWidth;

        const y0 = Math.floor(y / this.state.squaresPerWidth);
        const y1 = y % this.state.squaresPerWidth;

        return Math.sqrt(Math.pow(x0 - y0, 2) + Math.pow(x1 - y1, 2));
    }

    initializeScoreArray(width) {
        var scoreArray = Array.from(new Array(width * width), () => width * width);
        return scoreArray;
    }

    aStar() {
        const goal = this.state.endPosition;
        const width = this.state.squaresPerWidth;

        var openList = [];
        var closedList = [];

        openList.push(this.state.startPosition);

        var cameFrom = [];

        var gScore = this.initializeScoreArray(width);
        gScore[this.state.startPosition] = 0;

        var fScore = this.initializeScoreArray(width);
        fScore[this.state.startPosition] = this.distance(this.state.startPosition, goal);

        while (openList.length > 0) {

            var currentNodeIndex = this.findNodeWithMinimalCost(openList, fScore);

            if (currentNodeIndex === goal) {
                return this.reconstructPath(cameFrom, currentNodeIndex);
            }

            openList.splice(openList.indexOf(currentNodeIndex), 1);

            closedList.push(currentNodeIndex);

            var neighborList = this.getNeighborList(currentNodeIndex);

            for (var neighbor of neighborList) {

                if (closedList.indexOf(neighbor) > -1) {
                    continue;
                }

                if (openList.indexOf(neighbor) < 0) {
                    openList.push(neighbor);
                }

                var tentativeGScore = gScore[currentNodeIndex] + this.manhattanDistance(currentNodeIndex, neighbor);

                if (tentativeGScore > gScore[neighbor] - 1) {
                    continue;
                }

                cameFrom[neighbor] = currentNodeIndex;
                gScore[neighbor] = tentativeGScore;
                fScore[neighbor] = gScore[neighbor] + this.distance(neighbor, goal);
            }
        }
        return null;
    }

    reconstructPath(cameFrom, current) {
        var totalPath = [current];

        while (cameFrom[current] !== undefined) {
            current = cameFrom[current];
            totalPath.push(current);
        }
        return totalPath;

    }

    findNodeWithMinimalCost(itemList, valueList) {
        var candidateIndex = itemList[0];
        for (var item of itemList) {
            if (valueList[item] < valueList[candidateIndex]) {
                candidateIndex = item;
            }
        }

        return candidateIndex;
    }

    getNeighborList(i) {

        var neighborList = [];

        const width = this.state.squaresPerWidth;
        const board = this.state.board;

        // Up
        if (i > width - 1) {
            if (board[i - width] !== 2) {
                neighborList.push(i - width);
            }
        }

        // Down
        if (i < (width * (width - 1) )) {
            if (board[i + width] !== 2) {
                neighborList.push(i + width);
            }
        }

        // Left
        if (i % width !== 0) {
            if (board[i - 1] !== 2) {
                neighborList.push(i - 1);
            }
        }

        // Right
        if ((i % width) !== width - 1) {
            if (board[i + 1] !== 2) {
                neighborList.push(i + 1);
            }
        }

        return neighborList;
    }

    launchAStar() {
        let positionsSet = (this.state.startPosition !== -1 && this.state.endPosition !== -1);
        if (positionsSet) {

            const tmpResult = this.aStar();
            const tmpBoard = this.state.board;

            if (tmpResult != null) {
                for (var i = 1; i < tmpResult.length - 1; i++) {
                    tmpBoard[tmpResult[i]] = 4;
                }

                this.setState({
                    board: tmpBoard,
                    pathResult: tmpResult,
                    nextItemIndex: tmpResult - 2
                });
            }
        }
    }

    resetApplication() {
        var tmpBoard = Array.from(new Array(this.state.squaresPerWidth * this.state.squaresPerWidth));

        this.setState({
            board: tmpBoard,
            startPosition: -1,
            endPosition: -1,
            startPositionSet: false,
            endPositionSet: false,
            pathResult: [],
            selectStartPosition: true,
            selectEndPosition: false,
            selectObstaclePosition: false,
            boardUpdateNeeded: true,
            nextItemIndex: 1,
            timerSet: false
        });
    }

    handleSquareNumberChange(newSquareNumber) {
        this.setState({
            boardUpdateNeeded: true
        }, () => this.setState({squaresPerWidth: newSquareNumber}, () => this.resetApplication()));
    }

    convertCoordinatesToPosition = (x, y) => {
        var scale = this.state.boardWidth / this.state.squaresPerWidth;
        return Math.floor(x / scale) + this.state.squaresPerWidth * Math.floor(y / scale);
    }

    render() {
        let info = 'Start position: ';
        if (this.state.startPosition !== -1) {
            info = info + this.state.startPosition
        } else {
            info = info + 'unset'
        }

        info = info + ' End position: '
        if (this.state.endPosition !== -1) {
            info = info + this.state.endPosition;
        } else {
            info = info + 'unset'
        }

        return (
            <div className="App">
                <Header/>
                <Board
                    squaresPerWidth={this.state.squaresPerWidth}
                    boardWidth={this.state.boardWidth}
                    board={this.state.board}
                    info={info}
                    pathResult={this.state.pathResult}
                    nextItemIndex={this.state.nextItemIndex}
                    timerSet={this.state.timerSet}
                    boardUpdateNeeded={this.state.boardUpdateNeeded}
                    squareType={this.state.squareType}

                    startPosition={this.state.startPosition}
                    endPosition={this.state.endPosition}

                    updateStartPosition={this.updateStartPosition}
                    updateEndPosition={this.updateEndPosition}
                    updateObstaclePosition={this.updateObstaclePosition}

                    selectingStartPosition={this.selectingStartPosition}
                    selectingObstaclePosition={this.selectingObstaclePosition}
                    selectingEndPosition={this.selectingEndPosition}

                    convertCoordinatesToPosition={this.convertCoordinatesToPosition}
                    resetApplication={this.resetApplication}
                    handleSquareNumberChange={this.handleSquareNumberChange}

                    handleTimerCreation={this.handleTimerCreation}
                    updateNextItemIndex={this.updateNextItemIndex}
                    gridUpdated={this.gridUpdated}
                />
                <p className={styles.launch_algorithm}>
                    <button className={styles.button} type="button" onClick={this.launchAStar}>Launch the algorithm
                    </button>
                </p>
            </div>
        );
    }
}

export default App;
