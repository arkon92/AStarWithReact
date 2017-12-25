import React, {Component} from 'react';
import './App.css';
import Header from './Header.js';
import Board from "./Board.js";
import InfoBoard from './InfoBoard.js';

class App extends Component {

    constructor(props) {
        super(props);

        var tmpSquaresPerWidth = 10;

        this.state = {
            squaresPerWidth: tmpSquaresPerWidth,
            boardWidth: 400,
            pathResult: [],
            nextItemIndex: 0,
            timerSet: false
        };

        this.updateStartPosition = this.updateStartPosition.bind(this);
        this.updateEndPosition = this.updateEndPosition.bind(this);
        this.updateObstaclePosition = this.updateObstaclePosition.bind(this);
        this.launchAStar = this.launchAStar.bind(this);
        this.resetApplication = this.resetApplication.bind(this);
        this.handleSquareNumberChange = this.handleSquareNumberChange.bind(this);
        this.handleUpdateState = this.handleUpdateState.bind(this);
        this.manhattanDistance = this.manhattanDistance.bind(this);
    }


    updateStartPosition(index) {
        const tmpBoard = this.state.board;
        tmpBoard[index] = 1;
        
        this.setState((prevState, props) => {
            return {
                startPosition: index,
                board: tmpBoard
            };
        });
    }

    updateEndPosition(index) {
        const tmpBoard = this.state.board;
        tmpBoard[index] = 3;

        this.setState({
            endPosition: index,
            board: tmpBoard
        });
    }

    updateObstaclePosition(index) {
        const tmpBoard = this.state.board;
        tmpBoard[index] = 2;

        this.setState({
            board: tmpBoard
        });
    }

    componentDidMount() {
        console.log('App did mount');
        if (this.props.boardUpdateNeeded) {
            this.setState({boardUpdateNeeded: false});
        }
    }

    componentWillUpdate() {
        console.log('App will update');
        if (this.props.boardUpdateNeeded) {
            this.setState({boardUpdateNeeded: false});
        }
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
                return this.reconstruct_path(cameFrom, currentNodeIndex);
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

    reconstruct_path(cameFrom, current) {
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
            pathResult: [],
            selectStartPosition: true,
            selectEndPosition: false,
            selectObstaclePosition: false,
            boardUpdateNeeded: true,
            nextItemIndex: 1,
            timerSet: false
        });
    }

    handleUpdateState(object, callback) {
        this.setState(object, callback);
    }

    handleSquareNumberChange(newSquareNumber) {
        this.setState({squaresPerWidth: newSquareNumber}, () => this.resetApplication());
    }

    render() {
        const info = this.state.startPosition + '|' + this.state.endPosition;

        return (
            <div className="App">
                <Header/>
                <Board board={this.state.board}
                       squaresPerWidth={this.state.squaresPerWidth}
                       boardWidth={this.state.boardWidth}
                       pathResult={this.state.pathResult}
                       selectStartPosition={this.state.selectStartPosition}
                       selectEndPosition={this.state.selectEndPosition}
                       selectObstaclePosition={this.state.selectObstaclePosition}
                       boardUpdateNeeded={this.state.boardUpdateNeeded}
                       nextItemIndex={this.state.nextItemIndex}
                       timerSet={this.state.timerSet}
                       updateStartPosition={this.updateStartPosition}
                       updateEndPosition={this.updateEndPosition}
                       updateObstaclePosition={this.updateObstaclePosition}
                       convertCoordinatesToPosition={this.convertCoordinatesToPosition}
                       resetApplication={this.resetApplication}
                       handleSquareNumberChange={this.handleSquareNumberChange}
                       handleUpdateState={this.handleUpdateState}/>
                <InfoBoard info={info}/>
                <button type="button" onClick={this.launchAStar}>Launch the simulation !</button>
            </div>
        );
    }
}

export default App;
