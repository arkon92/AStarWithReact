import React, {Component} from 'react';
import BoardController from './BoardController';

class Board extends Component {

    constructor(props) {
        super(props);

        var tmpBoard = Array.from(new Array(props.squaresPerWidth * props.squaresPerWidth));

        this.state = {
            board: tmpBoard,
            startPositionSet: false,
            endPositionSet: false,
            startPosition: -1,
            endPosition: -1,
            selectStartPosition: true,
            selectEndPosition: false,
            selectObstaclePosition: false,
            boardUpdateNeeded: true,
        };

        this.typeSelectionChange = this.typeSelectionChange.bind(this);
        this.squareNumberSelectionChange = this.squareNumberSelectionChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    onMouseMove(e) {
        if (e.nativeEvent.offsetX < 0 || e.nativeEvent.offsetY < 0 || this.props.pathResult.length > 0) {
            return;
        }

        var convertedCoordinates = this.props.convertCoordinatesToPosition(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

        let squareType = this.props.board[convertedCoordinates];
        let specialSquares = ['1', '2', '3', '4'];

        if (specialSquares.indexOf(squareType) > -1) {
            return;
        }

        if (this.props.selectStartPosition && !this.state.startPositionSet) {
            this.setState({startPositionSet: true}, () => this.props.updateStartPosition(convertedCoordinates));
        }
        else if (this.props.selectEndPosition && !this.state.endPositionSet) {
            this.setState({endPositionSet: true});
            this.props.handleUpdateState({
                selectStartPosition: false,
                selectObstaclePosition: true,
                selectEndPosition: false
            });
            this.props.updateEndPosition(convertedCoordinates);
        }
        else if (this.props.selectObstaclePosition) {
            this.props.updateObstaclePosition(convertedCoordinates);
        }
    }

    componentDidMount() {
        if (this.props.boardUpdateNeeded) {
            this.createGridPattern();
        }
    }

    componentWillUpdate() {
        if (this.props.boardUpdateNeeded) {
            this.cleanCanvas();
            this.createGridPattern();
        }
    }

    componentDidUpdate() {
        for (let i = 0; i < this.props.board.length; i++) {
            if (this.props.board[i] === 1) {
                this.createSquare(i, 'blue');
            }
            else if (this.props.board[i] === 2) {
                this.createSquare(i, 'black');
            }
            else if (this.props.board[i] === 3) {
                this.createSquare(i, 'green');
            }
        }

        if (this.props.pathResult !== null && this.props.pathResult.length > 0 && this.timerID === undefined) {

            this.props.handleUpdateState({nextItemIndex: this.props.pathResult.length - 2}, () => {
                    if (this.timerID === undefined) {
                        this.timerID = setInterval(
                            () => this.drawPathResult(),
                            100
                        );
                        this.props.handleUpdateState({timerSet: true});
                    }
                }
            );

        }
    }

    cleanCanvas() {
        var canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.clearRect(0, 0, this.props.boardWidth, this.props.boardWidth);
        canvasContext.beginPath();
    }

    createGridPattern() {
        var scale = this.props.boardWidth / this.props.squaresPerWidth;

        var canvasContext = this.refs.canvas.getContext('2d');
        for (let i = 1; i < this.props.squaresPerWidth; i++) {
            canvasContext.moveTo(i * scale, 0);
            canvasContext.lineTo(i * scale, this.props.squaresPerWidth * scale);
        }

        for (let i = 1; i < this.props.squaresPerWidth; i++) {
            canvasContext.moveTo(0, i * scale);
            canvasContext.lineTo(this.props.squaresPerWidth * scale, i * scale);
        }

        canvasContext.stroke();
    }

    createSquare(i, color) {
        let scale = this.props.boardWidth / this.props.squaresPerWidth;

        let canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.fillStyle = color;
        let position = {
            x: (i * scale) % this.props.boardWidth,
            y: Math.floor(i / this.props.squaresPerWidth) * scale
        }

        canvasContext.fillRect(position.x, position.y, scale, scale);
        canvasContext.stroke();
    }

    typeSelectionChange(value) {
        if (value === 0) {
            this.props.handleUpdateState(
                {
                    selectStartPosition: true,
                    selectObstaclePosition: false,
                    selectEndPosition: false
                });
        }
        else if (value === 1) {
            this.props.handleUpdateState({
                selectStartPosition: false,
                selectObstaclePosition: true,
                selectEndPosition: false
            });
        }
        else if (value === 2)
            this.props.handleUpdateState({
                selectStartPosition: false,
                selectObstaclePosition: false,
                selectEndPosition: true
            });
    }


    squareNumberSelectionChange(newSquareNumber) {
        this.props.handleUpdateState({boardUpdateNeeded: true}, () => this.props.handleSquareNumberChange(newSquareNumber));
    }

    handleReset() {
        var canvasContext = this.refs.canvas.getContext('2d');
        canvasContext.clearRect(0, 0, this.props.boardWidth, this.props.boardWidth);
        canvasContext.beginPath();
        this.createGridPattern();
        clearInterval(this.timerID);
        this.timerID = undefined
        this.setState({
            startPositionSet: false,
            endPositionSet: false
        });
        this.props.resetApplication();
    }

    drawPathResult() {

        const pathResult = this.props.pathResult;
        const pathResultLength = pathResult.length;
        const currentIndex = this.props.nextItemIndex;

        let newIndex = 0;


        if (currentIndex === 0) {
            this.createSquare(pathResult[currentIndex + 1], 'pink');
            clearInterval(this.timerID);
        }
        else if (currentIndex === pathResultLength - 2) {
            this.createSquare(pathResult[currentIndex], 'red');
            newIndex = currentIndex - 1;
        }
        else {
            this.createSquare(pathResult[currentIndex + 1], 'pink');
            this.createSquare(pathResult[currentIndex], 'red');
            newIndex = currentIndex - 1;
        }

        this.props.handleUpdateState({
            nextItemIndex: newIndex
        });
    }

    convertCoordinatesToPosition = (x, y, boardWidth, squaresPerWidth) => {
        var scale = boardWidth / squaresPerWidth;
        return Math.floor(x / scale) + squaresPerWidth * Math.floor(y / scale);
    }

    render() {
        var positionsSet = (this.state.startPositionSet & this.state.endPositionSet);
        return (
            <div className="Board">
                <canvas ref="canvas" width={this.props.boardWidth} height={this.props.boardWidth}
                        onMouseDown={this.onMouseMove.bind(this)}
                        style={{borderWidth: '1px', borderStyle: 'outset', borderColor: '#000000'}}></canvas>
                <BoardController positionsSet={positionsSet}
                                 typeSelectionChange={this.typeSelectionChange}
                                 squareNumberChange={this.squareNumberSelectionChange}
                                 resetApplication={this.handleReset}/>
            </div>
        )
    }

}

export default Board;